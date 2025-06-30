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
import { Plus, Search, DollarSign, Calendar, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { IncomeTransaction, Client, Project } from "@/types"

export default function IncomePage() {
  const [incomeTransactions, setIncomeTransactions] = useState<IncomeTransaction[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredIncome, setFilteredIncome] = useState<IncomeTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    clientId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    projectId: "",
  })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchIncomeTransactions()
    fetchClients()
    fetchProjects()
  }, [user, router])

  useEffect(() => {
    const filtered = incomeTransactions.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(transaction.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProjectName(transaction?.projectId || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredIncome(filtered)
  }, [incomeTransactions, searchTerm, clients, projects]) // Added clients and projects to dependencies

  const fetchIncomeTransactions = async () => {
    try {
      const response = await fetch("/api/income-transactions")
      if (response.ok) {
        const data = await response.json()
        setIncomeTransactions(data)
      }
    } catch (error) {
      console.error("Error fetching income transactions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch income transactions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
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

    if (!formData.clientId || !formData.amount || !formData.date || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/income-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount),
        }),
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setIncomeTransactions([...incomeTransactions, newTransaction])
        setFormData({
          clientId: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          projectId: "",
        })
        setIsDialogOpen(false)
        toast({
          title: "Success",
          description: "Income added successfully",
        })
      } else {
        throw new Error("Failed to create income transaction")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive",
      })
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.nickname : "Unknown Client"
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

  const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income</h1>
            <p className="text-gray-600">Track and manage all incoming revenue</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Income Transaction</DialogTitle>
                <DialogDescription>Enter the income details below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nickname}
                        </SelectItem>
                      ))}
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
                    placeholder="e.g., Project payment, Consulting fee"
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
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Income</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-gray-500">Across {incomeTransactions.length} transactions</p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search income by description, client, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Income List */}
        <div className="space-y-4">
          {filteredIncome.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        <User className="inline mr-1 h-3 w-3" />
                        {getClientName(transaction.clientId)}
                      </span>
                      {transaction.projectId && transaction.projectId !== "none" && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {getProjectName(transaction.projectId)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{transaction.description}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(transaction.amount)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIncome.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No income transactions found</p>
            <p className="text-gray-400">Add your first income transaction to get started</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
