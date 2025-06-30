"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import type { ProjectProfit } from "@/types";

export default function ProfitsPage() {
  const [profits, setProfits] = useState<ProjectProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchProfits();
  }, [user, router]);

  const fetchProfits = async () => {
    try {
      const response = await fetch("/api/profits");
      if (response.ok) {
        const data = await response.json();
        setProfits(data);
      }
    } catch (error) {
      console.error("Error fetching profits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  const totalProfit = profits.reduce((sum, project) => sum + project.profit, 0);
  const totalRevenue = profits.reduce(
    (sum, project) => sum + project.totalIncome,
    0
  );
  const totalExpenses = profits.reduce(
    (sum, project) => sum + project.totalExpenses,
    0
  );
  const averageMargin =
    profits.length > 0
      ? profits.reduce((sum, project) => sum + project.profitMargin, 0) /
        profits.length
      : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profit Analysis</h1>
          <p className="text-gray-600">
            Track profitability across all projects
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Profit
              </CardTitle>
              <DollarSign
                className={`h-4 w-4 ${
                  totalProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(totalProfit)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Margin
              </CardTitle>
              <TrendingUp
                className={`h-4 w-4 ${
                  averageMargin >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  averageMargin >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {averageMargin.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Project Profitability</CardTitle>
            <CardDescription>
              Detailed profit breakdown for each project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profits.length > 0 ? (
              <div className="space-y-4">
                {profits.map((project) => (
                  <div
                    key={project.projectId}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {project.projectName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {project.clientName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            project.profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(project.profit)}
                        </p>
                        <p
                          className={`text-sm ${
                            project.profitMargin >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {project.profitMargin.toFixed(1)}% margin
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Revenue: </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(project.totalIncome)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expenses: </span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(project.totalExpenses)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No project data available</p>
                <p className="text-gray-400 text-sm">
                  Add projects and transactions to see profit analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
