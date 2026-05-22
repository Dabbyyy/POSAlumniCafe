import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  Calendar,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ArrowLeft,
  Clock,
  Shield,
  UtensilsCrossed,
  Edit3,
  Trash2,
  X,
  Save,
  Search,
  ImagePlus,
  BanknoteArrowUp,
  CheckCircle2,
  Printer,
  Receipt,
  Tag,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getMenuItems, saveMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, MenuItem, getMenuCategories, addMenuCategory, deleteMenuCategory } from './menuStorage';
import { getTransactions, TransactionRecord } from './transactions';
import { getCashiers, addCashier, updateCashier, deleteCashier, CashierAccount } from './cashierStorage';
import { getInventory, saveInventory, Inventory, getInventoryLogs, addInventoryLog, InventoryLog } from './inventoryStorage';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'cashiers' | 'reports' | 'menu' | 'inventory'>('analytics');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [time, setTime] = useState(new Date());

  // Menu management state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Coffee', icon: '☕', image: '', coffeeGrams: '', milkAmount: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Transaction state
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [viewingReceipt, setViewingReceipt] = useState<TransactionRecord | null>(null);

  // Cashier state
  const [cashiers, setCashiers] = useState<CashierAccount[]>([]);
  const [showCashierModal, setShowCashierModal] = useState(false);
  const [editingCashier, setEditingCashier] = useState<CashierAccount | null>(null);
  const [cashierForm, setCashierForm] = useState({ name: '', usernamePrefix: '', role: 'Cashier' });

  // Confirmation Modals State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'menu' | 'cashier'; name: string } | null>(null);

  // Report state
  const [reportDateFilter, setReportDateFilter] = useState('');
  const [reportShiftFilter, setReportShiftFilter] = useState('All');

  // Inventory state
  const [inventory, setInventory] = useState<Inventory>({ coffeeBeansGrams: 0, milkAmount: 0 });
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [addInventoryForm, setAddInventoryForm] = useState({ coffeeGrams: '', milkAmount: '' });

  useEffect(() => {
    setMenuItems(getMenuItems());
    setTransactions(getTransactions());
    setCashiers(getCashiers());
    setCategories(getMenuCategories());
    setInventory(getInventory());
    setInventoryLogs(getInventoryLogs());
    const timer = setInterval(() => setTime(new Date()), 1000);
    const refresh = setInterval(() => {
      setMenuItems(getMenuItems());
      setTransactions(getTransactions());
      setCashiers(getCashiers());
      setCategories(getMenuCategories());
      setInventory(getInventory());
      setInventoryLogs(getInventoryLogs());
    }, 2000);
    return () => { clearInterval(timer); clearInterval(refresh); };
  }, []);

  // Menu handlers
  const handleAddInventory = () => {
    const addedCoffee = parseFloat(addInventoryForm.coffeeGrams) || 0;
    const addedMilk = parseFloat(addInventoryForm.milkAmount) || 0;
    
    if (addedCoffee > 0 || addedMilk > 0) {
      const now = new Date();
      const newLogs = addInventoryLog({
        date: now.toISOString(),
        time: now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }),
        addedCoffeeGrams: addedCoffee,
        addedMilkAmount: addedMilk
      });
      setInventoryLogs(newLogs);
    }

    const newGrams = inventory.coffeeBeansGrams + addedCoffee;
    const newMilk = inventory.milkAmount + addedMilk;
    const updated = { coffeeBeansGrams: newGrams, milkAmount: newMilk };
    saveInventory(updated);
    setInventory(updated);
    setAddInventoryForm({ coffeeGrams: '', milkAmount: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    if (!formData.name || !formData.price) return;
    const updated = addMenuItem({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      icon: formData.icon,
      image: formData.image || undefined,
      coffeeGrams: formData.coffeeGrams ? parseFloat(formData.coffeeGrams) : undefined,
      milkAmount: formData.milkAmount ? parseFloat(formData.milkAmount) : undefined
    });
    setMenuItems(updated);
    setFormData({ name: '', price: '', category: 'Coffee', icon: '☕', image: '', coffeeGrams: '', milkAmount: '' });
    setShowAddModal(false);
  };

  const handleEditItem = () => {
    if (!editingItem || !formData.name || !formData.price) return;
    const updated = updateMenuItem(editingItem.id, {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      icon: formData.icon,
      image: formData.image || undefined,
      coffeeGrams: formData.coffeeGrams ? parseFloat(formData.coffeeGrams) : undefined,
      milkAmount: formData.milkAmount ? parseFloat(formData.milkAmount) : undefined
    });
    setMenuItems(updated);
    setEditingItem(null);
    setFormData({ name: '', price: '', category: 'Coffee', icon: '☕', image: '', coffeeGrams: '', milkAmount: '' });
  };

  const handleDeleteItem = (id: number, name: string) => {
    setItemToDelete({ id, type: 'menu', name });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'menu') {
      const updated = deleteMenuItem(itemToDelete.id);
      setMenuItems(updated);
    } else {
      setCashiers(deleteCashier(itemToDelete.id));
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      icon: item.icon,
      image: item.image || '',
      coffeeGrams: item.coffeeGrams ? item.coffeeGrams.toString() : '',
      milkAmount: item.milkAmount ? item.milkAmount.toString() : ''
    });
  };

  const handleAddCat = () => {
    if (!newCategoryName.trim()) return;
    setCategories(addMenuCategory(newCategoryName.trim()));
    setNewCategoryName('');
  };

  const handleDeleteCat = (cat: string) => {
    if (confirm(`Are you sure you want to delete the "${cat}" category?`)) {
      setCategories(deleteMenuCategory(cat));
      if (menuCategoryFilter === cat) setMenuCategoryFilter('All');
    }
  };

  const handleSaveCashier = () => {
    if (!cashierForm.name || !cashierForm.usernamePrefix) return;
    const fullUsername = `${cashierForm.usernamePrefix}@alumnicafe`;
    if (editingCashier) {
      setCashiers(updateCashier(editingCashier.id, { name: cashierForm.name, username: fullUsername, role: cashierForm.role }));
    } else {
      setCashiers(addCashier({ name: cashierForm.name, username: fullUsername, role: cashierForm.role }));
    }
    setShowCashierModal(false);
    setEditingCashier(null);
    setCashierForm({ name: '', usernamePrefix: '', role: 'Cashier' });
  };

  const openEditCashier = (acc: CashierAccount) => {
    setEditingCashier(acc);
    setCashierForm({
      name: acc.name,
      usernamePrefix: acc.username.split('@')[0],
      role: acc.role
    });
    setShowCashierModal(true);
  };

  const handleDeleteCashier = (id: number, name: string) => {
    setItemToDelete({ id, type: 'cashier', name });
    setShowDeleteConfirm(true);
  };

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Time', 'Cashier', 'Subtotal', 'VAT', 'Discount', 'Total', 'Cash', 'Change'];
    const rows = sortedTransactions.map(t => [
      t.id,
      t.date.split('T')[0],
      t.time,
      t.cashier,
      t.subtotal,
      t.vatAmount,
      t.discountAmount,
      t.total,
      t.cashTendered,
      t.change
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alumnicafe_sales_${reportDateFilter || 'all'}.csv`;
    link.click();
  };

  const exportInventoryCSV = () => {
    const headers = ['Log ID', 'Date', 'Time', 'Added Coffee (g)', 'Added Milk (ml)', 'Estimated Servings'];
    const rows = [...inventoryLogs].sort((a, b) => b.id - a.id).map(log => {
      const coffeeServings = Math.floor(log.addedCoffeeGrams / 18);
      const milkServings = Math.floor(log.addedMilkAmount / 150);
      const servingsText = [
        coffeeServings > 0 ? `${coffeeServings} coffee` : '',
        milkServings > 0 ? `${milkServings} milk` : ''
      ].filter(Boolean).join(' & ') || '0';
      
      return [
        log.id,
        log.date.split('T')[0],
        log.time,
        log.addedCoffeeGrams,
        log.addedMilkAmount,
        servingsText
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alumnicafe_inventory_log.csv`;
    link.click();
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesCat = menuCategoryFilter === 'All' || item.category === menuCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const formatDate = (date: Date) => date.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (date: Date) => date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  // Filter transactions based on period
  const { filteredTransactions, previousTransactions } = useMemo(() => {
    const now = new Date();
    
    const curr = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (analyticsPeriod === 'daily') {
        return t.date.startsWith(now.toISOString().slice(0, 10));
      } else if (analyticsPeriod === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return tDate >= weekAgo;
      } else if (analyticsPeriod === 'monthly') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const prev = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (analyticsPeriod === 'daily') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return t.date.startsWith(yesterday.toISOString().slice(0, 10));
      } else if (analyticsPeriod === 'weekly') {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(now.getDate() - 14);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return tDate >= twoWeeksAgo && tDate < oneWeekAgo;
      } else if (analyticsPeriod === 'monthly') {
        let prevMonth = now.getMonth() - 1;
        let prevYear = now.getFullYear();
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear--;
        }
        return tDate.getMonth() === prevMonth && tDate.getFullYear() === prevYear;
      }
      return false;
    });

    return { filteredTransactions: curr, previousTransactions: prev };
  }, [transactions, analyticsPeriod]);

  // Calculate KPIs dynamically
  const totalSalesPeriod = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalOrdersPeriod = filteredTransactions.length;
  const avgOrderValue = totalOrdersPeriod > 0 ? totalSalesPeriod / totalOrdersPeriod : 0;

  const prevTotalSales = previousTransactions.reduce((sum, t) => sum + t.total, 0);
  const prevTotalOrders = previousTransactions.length;
  const prevAvgOrderValue = prevTotalOrders > 0 ? prevTotalSales / prevTotalOrders : 0;

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? { trend: '+100%', up: true } : { trend: '0%', up: true };
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return {
      trend: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
      up: percentage >= 0
    };
  };

  const salesTrend = calculateTrend(totalSalesPeriod, prevTotalSales);
  const ordersTrend = calculateTrend(totalOrdersPeriod, prevTotalOrders);
  const avgOrderTrend = calculateTrend(avgOrderValue, prevAvgOrderValue);

  // Calculate Revenue Trends
  const trendData = useMemo(() => {
    if (analyticsPeriod === 'daily') {
      const hourBuckets = Array.from({ length: 14 }, (_, i) => {
        const hour = i + 7; // 7 AM to 8 PM
        const displayHour = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;
        return { name: displayHour, sales: 0, orders: 0 };
      });
      filteredTransactions.forEach(t => {
        const isPM = t.time.includes('PM');
        const hourStr = t.time.split(':')[0];
        let hour = parseInt(hourStr, 10);
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;

        const bucketIndex = hour - 7;
        if (bucketIndex >= 0 && bucketIndex < hourBuckets.length) {
          hourBuckets[bucketIndex].sales += t.total;
          hourBuckets[bucketIndex].orders += 1;
        }
      });
      return hourBuckets;
    } else if (analyticsPeriod === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekBuckets = days.map(day => ({ name: day, sales: 0, orders: 0 }));
      filteredTransactions.forEach(t => {
        const tDate = new Date(t.date);
        weekBuckets[tDate.getDay()].sales += t.total;
        weekBuckets[tDate.getDay()].orders += 1;
      });
      return weekBuckets;
    } else {
      const monthBuckets = [
        { name: 'Week 1', sales: 0, orders: 0 },
        { name: 'Week 2', sales: 0, orders: 0 },
        { name: 'Week 3', sales: 0, orders: 0 },
        { name: 'Week 4', sales: 0, orders: 0 }
      ];
      filteredTransactions.forEach(t => {
        const tDate = new Date(t.date);
        const date = tDate.getDate();
        const week = Math.min(Math.floor((date - 1) / 7), 3);
        monthBuckets[week].sales += t.total;
        monthBuckets[week].orders += 1;
      });
      return monthBuckets;
    }
  }, [filteredTransactions, analyticsPeriod]);

  // Calculate Category Sales
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    let grandTotal = 0;

    filteredTransactions.forEach(txn => {
      txn.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + itemTotal;
        grandTotal += itemTotal;
      });
    });

    if (grandTotal === 0) return [];

    return Object.entries(categoryTotals)
      .map(([name, val]) => ({ name, value: Math.round((val / grandTotal) * 100) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Calculate Product Ranking
  const productRanking = useMemo(() => {
    const counts: Record<string, { quantity: number; revenue: number; category: string }> = {};

    filteredTransactions.forEach(txn => {
      txn.items.forEach(item => {
        if (!counts[item.name]) {
          counts[item.name] = { quantity: 0, revenue: 0, category: item.category };
        }
        counts[item.name].quantity += item.quantity;
        counts[item.name].revenue += item.quantity * item.price;
      });
    });

    return Object.entries(counts)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredTransactions]);

  // Sort and filter transactions for the reports table
  let filteredReports = transactions;
  if (reportDateFilter) {
    filteredReports = filteredReports.filter(t => t.date.startsWith(reportDateFilter));
  }
  
  if (reportShiftFilter !== 'All') {
    filteredReports = filteredReports.filter(t => {
      const d = new Date(t.date);
      const hour = d.getHours();
      const minutes = d.getMinutes();
      const totalMinutes = hour * 60 + minutes;
      
      if (reportShiftFilter === 'Shift 1') {
        return totalMinutes >= 420 && totalMinutes < 760; // 7:00 AM - 12:40 PM
      } else if (reportShiftFilter === 'Shift 2') {
        return totalMinutes >= 760 && totalMinutes < 1100; // 12:40 PM - 6:20 PM
      } else if (reportShiftFilter === 'Shift 3') {
        return totalMinutes >= 1100 || totalMinutes < 420; // 6:20 PM - 12:00 MN
      }
      return true;
    });
  }
  
  const sortedTransactions = [...filteredReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCashiersCount = cashiers.length;

  return (
    <div className="flex flex-col h-screen select-none">
      {/* Admin Header */}
      <header className="h-20 bg-gradient-to-r from-hcdc-blue to-hcdc-blue-dark flex items-center justify-between px-10 text-white shadow-xl shrink-0 z-20">
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">POS Terminal</span>
          </Link>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <Shield className="w-5 h-5 text-hcdc-blue" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl leading-tight tracking-tight">Admin Dashboard</h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-hcdc-gold font-semibold">AlumniCafe Management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
          <Clock className="w-4 h-4 text-hcdc-gold" />
          <span className="text-sm font-semibold tabular-nums tracking-wide">
            {formatDate(time)} <span className="mx-2 opacity-30">|</span> {formatTime(time)}
          </span>
        </div>
      </header>

      <div className="flex-1 bg-[#F9FAFB] p-10 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <div className="flex justify-between items-end mb-8 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-hcdc-blue tracking-tight">Admin Dashboard</h2>
            <p className="text-gray-500 font-medium mt-1">Overview, performance, and management.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-hcdc-blue text-white shadow-md' : 'text-gray-500 hover:text-hcdc-blue hover:bg-hcdc-light-blue'
                }`}
            >
              <TrendingUp className="w-4 h-4" /> Analytics & Trends
            </button>
            <button
              onClick={() => setActiveTab('cashiers')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'cashiers' ? 'bg-hcdc-blue text-white shadow-md' : 'text-gray-500 hover:text-hcdc-blue hover:bg-hcdc-light-blue'
                }`}
            >
              <Users className="w-4 h-4" /> Cashier Accounts
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'reports' ? 'bg-hcdc-blue text-white shadow-md' : 'text-gray-500 hover:text-hcdc-blue hover:bg-hcdc-light-blue'
                }`}
            >
              <FileText className="w-4 h-4" /> Sales Report
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'menu' ? 'bg-hcdc-blue text-white shadow-md' : 'text-gray-500 hover:text-hcdc-blue hover:bg-hcdc-light-blue'
                }`}
            >
              <UtensilsCrossed className="w-4 h-4" /> Menu Items
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-hcdc-blue text-white shadow-md' : 'text-gray-500 hover:text-hcdc-blue hover:bg-hcdc-light-blue'
                }`}
            >
              <Package className="w-4 h-4" /> Inventory
            </button>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar -mr-4 pb-10">

          {/* --- ANALYTICS TAB --- */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Global Analytics Filter */}
              <div className="flex justify-end mb-2">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                  {(['daily', 'weekly', 'monthly'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setAnalyticsPeriod(period)}
                      className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${analyticsPeriod === period ? 'bg-hcdc-blue text-white shadow-md' : 'text-gray-400 hover:text-hcdc-blue hover:bg-hcdc-light-blue'
                        }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: `Total Sales (${analyticsPeriod})`, value: `₱ ${totalSalesPeriod.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: salesTrend.trend, up: salesTrend.up, icon: <BanknoteArrowUp className="w-6 h-6 text-hcdc-blue" /> },
                  { label: `Total Orders (${analyticsPeriod})`, value: totalOrdersPeriod.toString(), trend: ordersTrend.trend, up: ordersTrend.up, icon: <FileText className="w-6 h-6 text-hcdc-gold" /> },
                  { label: 'Avg Order Value', value: `₱ ${avgOrderValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: avgOrderTrend.trend, up: avgOrderTrend.up, icon: <TrendingUp className="w-6 h-6 text-hcdc-red" /> },
                  { label: 'Total Cashiers', value: totalCashiersCount.toString(), trend: '0%', up: true, icon: <Users className="w-6 h-6 text-purple-600" /> },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {kpi.icon}
                      </div>
                      <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${kpi.up ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                        {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {kpi.trend}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-800 tracking-tight">{kpi.value}</h3>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">{kpi.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <div className="col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-black text-gray-800">Revenue Trends</h3>
                      <p className="text-xs text-gray-500 font-medium">Sales performance over time</p>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1A3A6B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1A3A6B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="orders" stroke="#1A3A6B" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-gray-800">Sales by Category</h3>
                    <p className="text-xs text-gray-500 font-medium">Distribution of revenue</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    {categoryData.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center">No sales data available yet.</p>
                    ) : (
                      categoryData.map((cat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-700">{cat.name}</span>
                            <span className="text-hcdc-blue">{cat.value}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${cat.value}%`,
                                backgroundColor: i === 0 ? '#1A3A6B' : i === 1 ? '#E8A020' : i === 2 ? '#C0282A' : '#9ca3af'
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Product Ranking Section */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-800">Top Selling Products</h3>
                    <p className="text-xs text-gray-500 font-medium">Performance ranking based on units sold</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="px-4 py-2 bg-hcdc-light-blue rounded-xl text-hcdc-blue text-[10px] font-black uppercase tracking-widest">
                      Items: {productRanking.length}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productRanking.slice(0, 9).map((product, i) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-hcdc-blue/20 hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{product.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-hcdc-blue">{product.quantity} sold</p>
                        <p className="text-[10px] font-bold text-hcdc-red italic">₱{product.revenue.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                  {productRanking.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-gray-400 font-medium">No sales data available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- CASHIERS TAB --- */}
          {activeTab === 'cashiers' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-black text-gray-800">Manage Accounts</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Add, edit, or disable cashier access.</p>
                </div>
                <button onClick={() => setShowCashierModal(true)} className="bg-hcdc-blue text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-hcdc-blue-dark transition-colors shadow-md">
                  <Plus className="w-4 h-4" /> Add Cashier
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                      <th className="p-6 font-black">Name</th>
                      <th className="p-6 font-black">Username</th>
                      <th className="p-6 font-black">Role</th>
                      <th className="p-6 font-black">Last Login</th>
                      <th className="p-6 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cashiers.map((acc) => (
                      <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-hcdc-light-blue text-hcdc-blue flex items-center justify-center font-black">
                              {acc.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-800">{acc.name}</span>
                          </div>
                        </td>
                        <td className="p-6 font-mono text-sm text-gray-500">{acc.username}</td>
                        <td className="p-6">
                          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                            {acc.role}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {acc.lastLogin || 'Never logged in'}
                          </span>
                        </td>

                        <td className="p-6 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditCashier(acc)} className="p-2 text-hcdc-blue bg-hcdc-light-blue hover:bg-hcdc-blue hover:text-white rounded-xl transition-all">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCashier(acc.id, acc.name)} className="p-2 text-hcdc-red bg-red-50 hover:bg-hcdc-red hover:text-white rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- SALES REPORT TAB --- */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div>
                  <h3 className="text-xl font-black text-gray-800">Transaction History</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Detailed log of all sales.</p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={reportDateFilter}
                      onChange={(e) => setReportDateFilter(e.target.value)}
                      className="bg-white border-2 border-gray-100 text-gray-600 pl-10 pr-4 py-2 rounded-xl font-bold text-sm focus:border-hcdc-blue focus:ring-0 transition-colors shadow-sm outline-none"
                    />
                    {reportDateFilter && (
                      <button
                        onClick={() => setReportDateFilter('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-hcdc-red"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                      value={reportShiftFilter}
                      onChange={(e) => setReportShiftFilter(e.target.value)}
                      className="bg-white border-2 border-gray-100 text-gray-600 pl-10 pr-8 py-2 rounded-xl font-bold text-sm focus:border-hcdc-blue focus:ring-0 transition-colors shadow-sm outline-none appearance-none"
                    >
                      <option value="All">All Shifts</option>
                      <option value="Shift 1">Shift 1 (7:00 AM - 12:40 PM)</option>
                      <option value="Shift 2">Shift 2 (12:40 PM - 6:20 PM)</option>
                      <option value="Shift 3">Shift 3 (6:20 PM - 12:00 MN)</option>
                    </select>
                  </div>
                  <button
                    onClick={exportCSV}
                    disabled={sortedTransactions.length === 0}
                    className="bg-hcdc-blue text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-hcdc-blue-dark transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10">
                    <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                      <th className="p-6 font-black">Transaction ID</th>
                      <th className="p-6 font-black">Time</th>
                      <th className="p-6 font-black">Cashier</th>
                      <th className="p-6 font-black text-right">Amount</th>
                      <th className="p-6 font-black text-center">Status</th>
                      <th className="p-6 font-black text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-gray-400 font-medium">No transactions yet.</td>
                      </tr>
                    ) : (
                      sortedTransactions.map((txn, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-6 font-mono text-sm font-bold text-hcdc-blue">{txn.id}</td>
                          <td className="p-6 text-sm text-gray-500 font-medium">{txn.time}</td>
                          <td className="p-6 text-sm font-bold text-gray-700">{txn.cashier}</td>
                          <td className="p-6 text-right font-black text-gray-800">
                            ₱ {txn.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-6 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-100 px-3 py-1.5 rounded-lg inline-block">
                              Completed
                            </span>
                          </td>
                          <td className="p-6 text-center">
                            <button
                              onClick={() => setViewingReceipt(txn)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-hcdc-light-blue text-hcdc-blue rounded-lg text-[11px] font-bold transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- MENU MANAGEMENT TAB --- */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full"
                    />
                  </div>
                  <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto max-w-full no-scrollbar">
                    <button
                      onClick={() => setMenuCategoryFilter('All')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${menuCategoryFilter === 'All' ? 'bg-hcdc-blue text-white' : 'text-gray-400 hover:text-gray-700'}`}
                    >All</button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setMenuCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${menuCategoryFilter === cat ? 'bg-hcdc-blue text-white' : 'text-gray-400 hover:text-gray-700'}`}
                      >{cat}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    className="bg-hcdc-gold text-hcdc-blue px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#D4921C] transition-colors shadow-md"
                  >
                    <Tag className="w-4 h-4" /> Categories
                  </button>
                  <button
                    onClick={() => { setShowAddModal(true); setEditingItem(null); setFormData({ name: '', price: '', category: categories[0] || 'Coffee', icon: '☕', image: '', coffeeGrams: '', milkAmount: '' }); }}
                    className="bg-hcdc-blue text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-hcdc-blue-dark transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {filteredMenu.map((item) => (
                  <div key={item.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-hcdc-light-blue flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{item.icon}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm leading-snug">{item.name}</h3>
                        <p className="text-hcdc-red font-black text-lg mt-1 tracking-tight">₱{item.price.toFixed(2)}</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(item)}
                        className="w-8 h-8 rounded-full bg-hcdc-light-blue text-hcdc-blue flex items-center justify-center hover:bg-hcdc-blue hover:text-white transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="w-8 h-8 rounded-full bg-red-50 text-hcdc-red flex items-center justify-center hover:bg-hcdc-red hover:text-white transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-gray-400 font-medium">Showing {filteredMenu.length} of {menuItems.length} items</p>
            </div>
          )}

          {/* --- INVENTORY TAB --- */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-800 mb-6">Current Stock</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="font-bold text-gray-600">Coffee Beans</span>
                      <span className="text-2xl font-black text-hcdc-blue">{inventory.coffeeBeansGrams.toLocaleString()} g</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="font-bold text-gray-600">Milk</span>
                      <span className="text-2xl font-black text-hcdc-blue">{inventory.milkAmount.toLocaleString()} ml</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-800 mb-6">Add Stock</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Add Coffee Beans (g)</label>
                      <input
                        type="number"
                        value={addInventoryForm.coffeeGrams}
                        onChange={(e) => setAddInventoryForm({ ...addInventoryForm, coffeeGrams: e.target.value })}
                        className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue rounded-xl font-bold transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Add Milk (ml)</label>
                      <input
                        type="number"
                        value={addInventoryForm.milkAmount}
                        onChange={(e) => setAddInventoryForm({ ...addInventoryForm, milkAmount: e.target.value })}
                        className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue rounded-xl font-bold transition-all"
                        placeholder="0"
                      />
                    </div>
                    <button
                      onClick={handleAddInventory}
                      className="w-full h-12 bg-hcdc-blue hover:bg-hcdc-blue-dark text-white font-black rounded-xl transition-all shadow-md mt-2"
                    >
                      Update Inventory
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                  <h3 className="text-xl font-black text-gray-800">Available Servings Estimate</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Based on current stock and item recipes.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                        <th className="p-6">Item</th>
                        <th className="p-6">Required Coffee (g)</th>
                        <th className="p-6">Required Milk</th>
                        <th className="p-6 text-right">Available Servings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {menuItems.filter(item => item.coffeeGrams || item.milkAmount).map(item => {
                        let coffeeServings = Infinity;
                        let milkServings = Infinity;

                        if (item.coffeeGrams && item.coffeeGrams > 0) {
                          coffeeServings = Math.floor(inventory.coffeeBeansGrams / item.coffeeGrams);
                        }
                        if (item.milkAmount && item.milkAmount > 0) {
                          milkServings = Math.floor(inventory.milkAmount / item.milkAmount);
                        }

                        const minServings = Math.min(coffeeServings, milkServings);
                        const isLow = minServings < 10;
                        const isOut = minServings === 0;

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 font-bold text-gray-800">{item.name}</td>
                            <td className="p-6 font-mono text-sm text-gray-500">{item.coffeeGrams || '-'}</td>
                            <td className="p-6 font-mono text-sm text-gray-500">{item.milkAmount || '-'}</td>
                            <td className="p-6 text-right">
                              <span className={`px-3 py-1.5 rounded-lg text-sm font-black ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                {isFinite(minServings) ? minServings : '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {menuItems.filter(item => item.coffeeGrams || item.milkAmount).length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-gray-400 font-medium">No items with defined coffee/milk requirements.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mt-8">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-gray-800">Inventory Logs</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">History of added stock.</p>
                  </div>
                  <button
                    onClick={exportInventoryCSV}
                    disabled={inventoryLogs.length === 0}
                    className="bg-hcdc-blue text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-hcdc-blue-dark transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                        <th className="p-6">Date</th>
                        <th className="p-6">Time</th>
                        <th className="p-6">Added Coffee (g)</th>
                        <th className="p-6">Added Milk (ml)</th>
                        <th className="p-6 text-right">Estimated Servings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[...inventoryLogs].sort((a, b) => b.id - a.id).map(log => {
                        const coffeeServings = Math.floor(log.addedCoffeeGrams / 18);
                        const milkServings = Math.floor(log.addedMilkAmount / 150);
                        const servingsText = [
                          coffeeServings > 0 ? `${coffeeServings} coffee` : '',
                          milkServings > 0 ? `${milkServings} milk` : ''
                        ].filter(Boolean).join(' & ') || '-';
                        
                        return (
                          <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 font-bold text-gray-800">{log.date.split('T')[0]}</td>
                            <td className="p-6 font-mono text-sm text-gray-500">{log.time}</td>
                            <td className="p-6 font-mono text-sm text-green-600 font-bold">+{log.addedCoffeeGrams}</td>
                            <td className="p-6 font-mono text-sm text-green-600 font-bold">+{log.addedMilkAmount}</td>
                            <td className="p-6 text-right font-mono text-sm text-gray-500">{servingsText}</td>
                          </tr>
                        );
                      })}
                      {inventoryLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-gray-400 font-medium">No inventory logs found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {(showAddModal || editingItem) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-hcdc-blue p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-1">{editingItem ? 'Edit Item' : 'New Menu Item'}</h3>
                  <p className="text-2xl font-black tracking-tight">{editingItem ? formData.name || 'Editing...' : 'Add to Menu'}</p>
                </div>
                <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Item Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vanilla Latte"
                    className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue focus:bg-white rounded-2xl font-bold text-lg transition-all focus:ring-0"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Price (₱)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue focus:bg-white rounded-2xl font-bold text-lg transition-all focus:ring-0"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Item Image (PNG)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImagePlus className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-hcdc-light-blue border-2 border-gray-100 hover:border-hcdc-blue/20 rounded-2xl cursor-pointer transition-all">
                        <ImagePlus className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-500">{formData.image ? 'Change Image' : 'Upload PNG'}</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {formData.image && (
                        <button onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="text-[10px] font-bold text-hcdc-red mt-2 hover:underline">Remove image</button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Coffee Beans (g)</label>
                    <input
                      type="number"
                      value={formData.coffeeGrams}
                      onChange={(e) => setFormData({ ...formData, coffeeGrams: e.target.value })}
                      placeholder="e.g. 18"
                      className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue focus:bg-white rounded-2xl font-bold text-lg transition-all focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Milk (ml/pumps)</label>
                    <input
                      type="number"
                      value={formData.milkAmount}
                      onChange={(e) => setFormData({ ...formData, milkAmount: e.target.value })}
                      placeholder="e.g. 150"
                      className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue focus:bg-white rounded-2xl font-bold text-lg transition-all focus:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${formData.category === cat ? 'bg-hcdc-blue border-hcdc-blue text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                    className="flex-1 h-14 bg-white border-2 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingItem ? handleEditItem : handleAddItem}
                    disabled={!formData.name || !formData.price}
                    className="flex-[2] h-14 bg-hcdc-blue hover:bg-hcdc-blue-dark text-white font-black rounded-2xl shadow-xl shadow-hcdc-blue/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100 text-sm uppercase tracking-wider"
                  >
                    <Save className="w-4 h-4" /> {editingItem ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* RECEIPT MODAL */}
      <AnimatePresence>
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:bg-transparent print:backdrop-blur-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="bg-hcdc-blue p-6 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold flex items-center gap-2"><Receipt className="w-5 h-5" /> Transaction Receipt</h3>
                <button onClick={() => setViewingReceipt(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB] scroll-smooth custom-scrollbar">
                {/* Simulated Thermal Receipt */}
                <div id="receipt-content" className="bg-white p-6 shadow-md mx-auto max-w-[320px] font-mono text-[11px] text-gray-800 border-t-8 border-hcdc-blue relative">
                  {/* Background watermark */}
                  <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none">
                    <UtensilsCrossed className="w-48 h-48" />
                  </div>

                  <div className="text-center space-y-0.5 mb-6 relative">
                    <p className="text-base font-black uppercase tracking-tight">AlumniCafe</p>
                    <p>Holy Cross of Davao College</p>
                    <p>Sta. Ana Ave., Davao City</p>
                    <p>VAT Reg TIN: 000-000-0000</p>
                    <p>Tel: (082) 000-0000</p>
                  </div>

                  <div className="border-t border-dashed border-gray-400 py-3 space-y-0.5 relative">
                    <div className="flex justify-between"><span>Date:</span> <span>{viewingReceipt.date.split('T')[0]}</span></div>
                    <div className="flex justify-between"><span>Time:</span> <span>{viewingReceipt.time}</span></div>
                    <div className="flex justify-between"><span>TXN#:</span> <span>{viewingReceipt.id}</span></div>
                    <div className="flex justify-between"><span>Cashier:</span> <span>{viewingReceipt.cashier}</span></div>
                  </div>

                  <div className="border-t border-gray-400 pt-3 mb-1 font-bold text-[10px] relative">
                    <div className="flex justify-between gap-4">
                      <span className="flex-1">ITEM</span>
                      <span className="w-8 text-center">QTY</span>
                      <span className="w-20 text-right">AMOUNT</span>
                    </div>
                  </div>
                  <div className="border-b border-gray-400 pb-2 mb-3 relative">
                    {viewingReceipt.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between gap-4 py-1 leading-tight">
                        <span className="flex-1 truncate">{item.name}</span>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <span className="w-20 text-right">{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 mb-4 relative">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>{viewingReceipt.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    {viewingReceipt.discountType !== 'REGULAR' && (
                      <div className="flex justify-between italic text-red-600">
                        <span>{viewingReceipt.discountType} Disc ({(viewingReceipt.discountRate * 100).toFixed(0)}%):</span>
                        <span>-{viewingReceipt.discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between"><span>VATable Amt:</span> <span>{(viewingReceipt.total - viewingReceipt.vatAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between"><span>VAT (12%):</span> <span>{viewingReceipt.vatAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-double border-gray-800 mt-2">
                      <span>TOTAL:</span>
                      <span>{viewingReceipt.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-gray-500"><span>Cash:</span> <span>{viewingReceipt.cashTendered.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Change:</span> <span>{viewingReceipt.change.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  </div>

                  <div className="text-center space-y-1 mt-6 border-t border-dashed border-gray-400 pt-4 relative">
                    <p className="font-bold">THANK YOU FOR YOUR PURCHASE</p>
                    <p>Please come again!</p>
                    <p className="mt-2 text-[9px] text-gray-400">THIS SERVES AS AN OFFICIAL RECEIPT</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 shrink-0 bg-white">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-hcdc-blue hover:bg-hcdc-blue-dark text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-5 h-5" /> Print Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CASHIER ADD/EDIT MODAL */}
      <AnimatePresence>
        {(showCashierModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-hcdc-blue p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-1">{editingCashier ? 'Edit Cashier' : 'New Cashier'}</h3>
                  <p className="text-2xl font-black tracking-tight">{editingCashier ? cashierForm.name || 'Editing...' : 'Add Account'}</p>
                </div>
                <button onClick={() => { setShowCashierModal(false); setEditingCashier(null); setCashierForm({ name: '', usernamePrefix: '', role: 'Cashier' }); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={cashierForm.name}
                    onChange={(e) => setCashierForm({ ...cashierForm, name: e.target.value })}
                    placeholder="e.g. Juan Dela Cruz"
                    className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue focus:bg-white rounded-2xl font-bold text-lg transition-all focus:ring-0"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Username</label>
                  <div className="flex bg-gray-50 rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-hcdc-blue focus-within:bg-white transition-all h-14">
                    <input
                      type="text"
                      value={cashierForm.usernamePrefix}
                      onChange={(e) => setCashierForm({ ...cashierForm, usernamePrefix: e.target.value })}
                      placeholder="e.g. juan"
                      className="flex-1 h-full px-6 bg-transparent border-none font-bold text-lg focus:ring-0 text-right"
                    />
                    <div className="flex items-center px-6 bg-gray-100 text-gray-500 font-bold text-lg select-none">
                      @alumnicafe
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Role</label>
                    <select
                      value={cashierForm.role}
                      onChange={(e) => setCashierForm({ ...cashierForm, role: e.target.value })}
                      className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue focus:bg-white rounded-2xl font-bold text-sm transition-all focus:ring-0"
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="Senior Cashier">Senior Cashier</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => { setShowCashierModal(false); setEditingCashier(null); setCashierForm({ name: '', usernamePrefix: '', role: 'Cashier' }); }}
                    className="flex-1 h-14 bg-white border-2 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCashier}
                    disabled={!cashierForm.name || !cashierForm.usernamePrefix}
                    className="flex-[2] h-14 bg-hcdc-blue hover:bg-hcdc-blue-dark text-white font-black rounded-2xl shadow-xl shadow-hcdc-blue/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100 text-sm uppercase tracking-wider"
                  >
                    <Save className="w-4 h-4" /> {editingCashier ? 'Save Changes' : 'Create Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CATEGORY MANAGER MODAL */}
      <AnimatePresence>
        {showCategoryManager && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="bg-hcdc-gold p-6 text-hcdc-blue flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Tag className="w-5 h-5" /> Manage Categories</h3>
                <button onClick={() => setShowCategoryManager(false)} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-8">
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-hcdc-blue focus:bg-white rounded-xl font-bold text-sm transition-all outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
                  />
                  <button
                    onClick={handleAddCat}
                    disabled={!newCategoryName.trim()}
                    className="bg-hcdc-blue text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-hcdc-blue-dark transition-all disabled:opacity-30 shadow-md shadow-hcdc-blue/20"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {categories.map(cat => (
                    <div key={cat} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                      <span className="font-bold text-gray-700">{cat}</span>
                      <button
                        onClick={() => handleDeleteCat(cat)}
                        className="p-2 text-gray-300 hover:text-hcdc-red transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">No categories created yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-hcdc-light-red rounded-full flex items-center justify-center mx-auto mb-6 text-hcdc-red">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black mb-2">Delete {itemToDelete.type === 'menu' ? 'Menu Item' : 'Cashier'}?</h3>
              <p className="text-sm text-gray-500 mb-8">
                Are you sure you want to remove <span className="font-bold text-gray-800">{itemToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-12 bg-gray-50 text-gray-400 font-bold rounded-xl hover:bg-gray-100">Cancel</button>
                <button onClick={handleConfirmDelete} className="flex-1 h-12 bg-hcdc-red text-white font-bold rounded-xl hover:bg-[#A01E1F] shadow-lg shadow-hcdc-red/20">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
