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
import { MainLayout } from "@/components/layout/main-layout"
import { Plus, Search, MapPin } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Client } from "@/types"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nickname: "",
    address: "",
    city: "",
  })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchClients()
  }, [user, router])

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredClients(filtered)
  }, [clients, searchTerm])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newClient = await response.json()
        setClients([...clients, newClient])
        setFormData({ nickname: "", address: "", city: "" })
        setIsDialogOpen(false)
        toast({
          title: "Success",
          description: "Client added successfully",
        })
      } else {
        throw new Error("Failed to create client")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      })
    }
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client database</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Enter the client details below to add them to your database.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nickname">Client Nickname</Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    required
                    placeholder="Enter client nickname"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    placeholder="Enter client address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    placeholder="Enter city"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Client</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search clients by name, city, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{client.nickname}</span>
                  <span className="text-sm text-gray-500">#{client.id}</span>
                </CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {client.city}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{client.address}</p>
                <p className="text-xs text-gray-500">Added: {new Date(client.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No clients found</p>
            <p className="text-gray-400">Add your first client to get started</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
