import { create } from "zustand";
import { mockPeople, type Person } from "@/mock-data/people";
import { mockDocuments, type Document } from "@/mock-data/documents";
import { mockChartData, type ChartDataPoint } from "@/mock-data/chart";
import { mockStats, type StatCard } from "@/mock-data/stats";

interface DashboardState {
  people: Person[];
  documents: Document[];
  chartData: ChartDataPoint[];
  stats: StatCard[];
  recentOrders: any[];
  recentAnalysis: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setChartData: (data: ChartDataPoint[]) => void;
  setRecentOrders: (data: any[]) => void;
  setRecentAnalysis: (data: any[]) => void;
  setPeople: (data: any[]) => void;
  getFilteredPeople: () => Person[];
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  people: mockPeople,
  documents: mockDocuments,
  chartData: mockChartData,
  stats: mockStats,
  recentOrders: [],
  recentAnalysis: [],
  searchQuery: "",
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  setChartData: (data) => {
    set({ chartData: data });
  },
  setRecentOrders: (data) => {
    set({ recentOrders: data });
  },
  setRecentAnalysis: (data) => {
    set({ recentAnalysis: data });
  },
  setPeople: (data) => {
    set({ people: data as any });
  },
  getFilteredPeople: () => {
    const { people, searchQuery } = get();
    if (!searchQuery) return people;
    const query = searchQuery.toLowerCase();
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        person.jobTitle.toLowerCase().includes(query) ||
        person.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  },
}));

