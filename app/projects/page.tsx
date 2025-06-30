"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import { Plus, Search, FolderOpen, Calendar, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import type { Project, Client } from "@/types"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "Planning",
  })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchProjects()
    fetchClients()
  }, [user, router])

  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProjects(filtered)
  }, [projects, searchTerm])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error",
        description: "Failed to fetch projects",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.clientId) {
      toast({
        title: "Error",
        description: "Project name and client are required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects([...projects, newProject])
        setFormData({
          name: "",
          clientId: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          status: "Planning",
        })
        setIsDialogOpen(false)
        toast({
          title: "Success",
          description: "Project added successfully",
        })
      } else {
        throw new Error("Failed to create project")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Planning: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      "On Hold": "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.nickname : "Unknown Client"
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

  const statusCounts = projects.reduce(
    (acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your project portfolio</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>Enter the project details below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter project name"
                  />
                </div>
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
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Project</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects by name or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
                <CardDescription className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {getClientName(project.clientId)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Started: {formatDate(project.startDate)}</span>
                  </div>
                  {project.endDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>End: {formatDate(project.endDate)}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">ID: {project.id}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found</p>
            <p className="text-gray-400">Add your first project to get started</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
