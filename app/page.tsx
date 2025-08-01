"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Star, Bookmark, Folder, Edit, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface BookmarkItem {
  id: string
  title: string
  url: string
  description?: string
  category: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  color: string
}

const defaultCategories: Category[] = [
  { id: "1", name: "仕事", color: "bg-blue-500" },
  { id: "2", name: "学習", color: "bg-green-500" },
  { id: "3", name: "エンターテイメント", color: "bg-purple-500" },
  { id: "4", name: "ニュース", color: "bg-red-500" },
  { id: "5", name: "その他", color: "bg-gray-500" },
]

export default function GridiaApp() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    category: "5",
    isFavorite: false,
  })

  // LocalStorageからデータを読み込み
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("gridia-bookmarks")
    const savedCategories = localStorage.getItem("gridia-categories")

    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }
  }, [])

  // データをLocalStorageに保存
  useEffect(() => {
    localStorage.setItem("gridia-bookmarks", JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    localStorage.setItem("gridia-categories", JSON.stringify(categories))
  }, [categories])

  // フィルタリングされたブックマーク
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesCategory = selectedCategory === "all" || bookmark.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || bookmark.isFavorite

    return matchesSearch && matchesCategory && matchesFavorites
  })

  // ブックマーク追加/編集
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.url) return

    const now = new Date().toISOString()

    if (editingBookmark) {
      // 編集
      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.id === editingBookmark.id ? { ...bookmark, ...formData, updatedAt: now } : bookmark,
        ),
      )
    } else {
      // 新規追加
      const newBookmark: BookmarkItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      }
      setBookmarks((prev) => [...prev, newBookmark])
    }

    resetForm()
  }

  // フォームリセット
  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      category: "5",
      isFavorite: false,
    })
    setEditingBookmark(null)
    setIsDialogOpen(false)
  }

  // 編集開始
  const startEdit = (bookmark: BookmarkItem) => {
    setEditingBookmark(bookmark)
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description || "",
      category: bookmark.category,
      isFavorite: bookmark.isFavorite,
    })
    setIsDialogOpen(true)
  }

  // ブックマーク削除
  const deleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))
  }

  // お気に入り切り替え
  const toggleFavorite = (id: string) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, isFavorite: !bookmark.isFavorite, updatedAt: new Date().toISOString() }
          : bookmark,
      ),
    )
  }

  // カテゴリ名取得
  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "その他"
  }

  // カテゴリ色取得
  const getCategoryColor = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.color || "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Bookmark className="text-blue-600" />
            Gridia
          </h1>
          <p className="text-gray-600">あなたのブックマークを効率的に管理</p>
        </div>

        {/* 検索・フィルター・追加ボタン */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ブックマークを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorites"
                checked={showFavoritesOnly}
                onCheckedChange={(checked) => setShowFavoritesOnly(checked as boolean)}
              />
              <Label htmlFor="favorites" className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                お気に入りのみ
              </Label>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingBookmark(null)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  ブックマーク追加
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingBookmark ? "ブックマーク編集" : "新しいブックマーク"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">タイトル *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="ブックマークのタイトル"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="ブックマークの説明（任意）"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">カテゴリ</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${category.color}`} />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favorite"
                      checked={formData.isFavorite}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isFavorite: checked as boolean }))
                      }
                    />
                    <Label htmlFor="favorite" className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      お気に入りに追加
                    </Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                      キャンセル
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingBookmark ? "更新" : "追加"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ブックマーク一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedCategory !== "all" || showFavoritesOnly
                  ? "マッチするブックマークが見つかりません"
                  : "まだブックマークがありません"}
              </p>
              <p className="text-gray-400 mt-2">
                {searchTerm || selectedCategory !== "all" || showFavoritesOnly
                  ? "検索条件を変更してみてください"
                  : "最初のブックマークを追加してみましょう"}
              </p>
            </div>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate mb-2">{bookmark.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getCategoryColor(bookmark.category)}`} />
                          {getCategoryName(bookmark.category)}
                        </Badge>
                        {bookmark.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {bookmark.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bookmark.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm truncate flex-1 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {bookmark.url}
                    </a>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-gray-400">
                      {new Date(bookmark.updatedAt).toLocaleDateString("ja-JP")}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(bookmark.id)}
                        className="p-1 h-8 w-8"
                      >
                        <Star
                          className={`w-4 h-4 ${bookmark.isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                        />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(bookmark)} className="p-1 h-8 w-8">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 統計情報 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{bookmarks.length}</div>
              <div className="text-sm text-gray-600">総ブックマーク数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{bookmarks.filter((b) => b.isFavorite).length}</div>
              <div className="text-sm text-gray-600">お気に入り</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-sm text-gray-600">カテゴリ数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{filteredBookmarks.length}</div>
              <div className="text-sm text-gray-600">表示中</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
