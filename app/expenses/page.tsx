"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainLayout } from "@/components/layout/main-layout"
import { Plus, Search, DollarSign, Calendar, Tag } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Expense, Project } from "@/types"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    category: "Team", // Updated default value
    amount: "",
    projectId: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchExpenses()
    fetchProjects()
  }, [user, router])

  useEffect(() => {
    const filtered = expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredExpenses(filtered)
  }, [expenses, searchTerm])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses")
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount),
        }),
      })

      if (response.ok) {
        const newExpense = await response.json()
        setExpenses([...expenses, newExpense])
        setFormData({
          category: "Team", // Updated default value
          amount: "",
          projectId: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
        })
        setIsDialogOpen(false)
        toast({
          title: "Success",
          description: "Expense added successfully",
        })
      } else {
        throw new Error("Failed to create expense")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Team: "bg-blue-100 text-blue-800",
      Tools: "bg-green-100 text-green-800",
      Vendor: "bg-purple-100 text-purple-800",
      Marketing: "bg-orange-100 text-orange-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project ? project.name : "No Project"
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600">Track and manage business expenses</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Enter the expense details below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Team">Team</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Vendor">Vendor</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="projectId">Project (Optional)</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Enter expense description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Expense</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-gray-500">Across {expenses.length} transactions</p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search expenses by description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}
                      >
                        <Tag className="inline mr-1 h-3 w-3" />
                        {expense.category}
                      </span>
                      {expense.projectId && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {getProjectName(expense.projectId)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{expense.description}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(expense.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(expense.amount)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExpenses.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No expenses found</p>
            <p className="text-gray-400">Add your first expense to get started</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
