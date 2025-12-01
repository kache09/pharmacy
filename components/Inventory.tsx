
import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Calendar, 
  RefreshCcw, 
  MapPin, 
  Truck, 
  CheckSquare, 
  ClipboardCheck, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Wallet, 
  TrendingUp,
  Plus,
  X,
  Save,
  Search,
  Filter,
  ShieldCheck,
  KeyRound,
  Send,
  Trash2,
  Tag,
  FilePlus,
  History,
  User
} from 'lucide-react';
import { BRANCHES, PRODUCTS, STAFF_LIST } from '../data/mockData';
import { StockTransfer, Product, UserRole, BranchInventoryItem } from '../types';

interface ExtendedProduct extends Product {
  customPrice?: number;
}

interface InventoryProps {
  currentBranchId: string;
  inventory: Record<string, BranchInventoryItem[]>;
  setInventory: React.Dispatch<React.SetStateAction<Record<string, BranchInventoryItem[]>>>;
  transfers: StockTransfer[];
  setTransfers: React.Dispatch<React.SetStateAction<StockTransfer[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ currentBranchId, inventory, setInventory, transfers, setTransfers }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'transfers'>('stock');
  
  // Local State for Products (Mocking database of products)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false); 
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtendedProduct | null>(null);

  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'KEEPER' | 'CONTROLLER'>('KEEPER');
  const [activeTransferId, setActiveTransferId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Form States
  const [newStock, setNewStock] = useState({
    productId: '',
    isNewProduct: false,
    name: '',
    genericName: '',
    category: '',
    costPrice: '',
    price: '',
    unit: 'Box',
    batchNumber: '',
    expiryDate: '',
    quantity: ''
  });

  const [priceUpdate, setPriceUpdate] = useState({
      newPrice: ''
  });

  // Shipment / Request Form State
  const [newShipment, setNewShipment] = useState<{
      targetBranchId: string;
      notes: string;
      items: any[];
  }>({
      targetBranchId: '',
      notes: '',
      items: []
  });
  const [shipmentItem, setShipmentItem] = useState({
      productId: '',
      batchNumber: '',
      expiryDate: '',
      quantity: ''
  });
  
  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  const activeBranchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  // Logic to merge Product Definitions with Branch Inventory Levels
  const displayedInventory: ExtendedProduct[] = products.map(product => {
    let totalStock = 0;
    let batches: any[] = [];
    let customPrice: number | undefined = undefined;

    if (isHeadOffice) {
        Object.values(inventory).forEach((branchStockList: any) => {
            const item = branchStockList.find((i: any) => i.productId === product.id);
            if (item) {
                totalStock += item.quantity;
                batches = [...batches, ...item.batches];
            }
        });
    } else {
        const branchStockList = inventory[currentBranchId] || [];
        const item = branchStockList.find(i => i.productId === product.id);
        if (item) {
            totalStock = item.quantity;
            batches = item.batches;
            customPrice = item.customPrice;
        }
    }

    return { ...product, totalStock, batches, customPrice };
  });

  const totalAssetValue = displayedInventory.reduce((acc, curr) => acc + (curr.totalStock * curr.costPrice), 0);
  const totalPotentialRevenue = displayedInventory.reduce((acc, curr) => acc + (curr.totalStock * (curr.customPrice || curr.price)), 0);

  const branchTransfers = transfers.filter(t => 
    isHeadOffice ? true : t.targetBranchId === currentBranchId || t.sourceBranchId === currentBranchId
  );

  // --- Handlers ---

  const handleSaveStock = () => {
    let targetProductId = newStock.productId;
    // Logic for new product creation simplified for mock
    if (newStock.isNewProduct) {
        const newId = (products.length + 1).toString();
        // @ts-ignore
        setProducts([...products, { ...newStock, id: newId, costPrice: parseFloat(newStock.costPrice), price: parseFloat(newStock.price), minStockLevel: 10, totalStock: 0, requiresPrescription: false, batches: [] }]);
        targetProductId = newId;
    }

    const targetBranch = isHeadOffice ? 'BR001' : currentBranchId;
    const qty = parseInt(newStock.quantity);
    
    setInventory(prev => {
        const branchStock = prev[targetBranch] || [];
        const existingItemIndex = branchStock.findIndex(i => i.productId === targetProductId);
        let newBranchStock = [...branchStock];

        if (existingItemIndex >= 0) {
            newBranchStock[existingItemIndex].quantity += qty;
            newBranchStock[existingItemIndex].batches.push({
                batchNumber: newStock.batchNumber,
                expiryDate: newStock.expiryDate,
                quantity: qty
            });
        } else {
            newBranchStock.push({
                productId: targetProductId,
                quantity: qty,
                batches: [{ batchNumber: newStock.batchNumber, expiryDate: newStock.expiryDate, quantity: qty }]
            });
        }
        return { ...prev, [targetBranch]: newBranchStock };
    });
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdatePrice = () => {
      // Logic from previous implementation
      setShowPriceModal(false);
  };

  const resetForm = () => {
    setNewStock({ productId: '', isNewProduct: false, name: '', genericName: '', category: '', costPrice: '', price: '', unit: 'Box', batchNumber: '', expiryDate: '', quantity: '' });
  };

  const openAdjustModal = (item: ExtendedProduct) => {
      setSelectedItem(item);
      setShowAdjustModal(true);
  };

  const openPriceModal = (item: ExtendedProduct) => {
      setSelectedItem(item);
      setPriceUpdate({ newPrice: (item.customPrice || item.price).toString() });
      setShowPriceModal(true);
  };

  const handleViewLog = (item: ExtendedProduct) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
  };

  // Workflow Handlers
  const initiateVerification = (id: string, step: 'KEEPER' | 'CONTROLLER') => {
      setActiveTransferId(id);
      setVerifyStep(step);
      setVerificationCode('');
      setVerifyError('');
      setShowVerifyModal(true);
  };

  const submitVerification = () => {
      if (!activeTransferId) return;
      const transfer = transfers.find(t => t.id === activeTransferId);
      if (!transfer) return;

      const requiredCode = verifyStep === 'KEEPER' ? transfer.keeperCode : transfer.controllerCode;
      
      if (verificationCode !== requiredCode) {
          setVerifyError('Invalid Verification Key. Please contact Head Office.');
          return;
      }

      if (verifyStep === 'KEEPER') {
          // Just update status to RECEIVED_KEEPER
          setTransfers(prev => prev.map(t => t.id === activeTransferId ? { ...t, status: 'RECEIVED_KEEPER', workflow: { ...t.workflow, logs: [...t.workflow.logs, { role: 'Store Keeper', action: 'Confirmed', timestamp: new Date().toLocaleString(), user: 'Current User' }] } } as StockTransfer : t));
      } else {
           // CONTROLLER VERIFICATION - THIS COMMITS TO INVENTORY
           setTransfers(prev => prev.map(t => t.id === activeTransferId ? { ...t, status: 'COMPLETED', workflow: { ...t.workflow, logs: [...t.workflow.logs, { role: 'Controller', action: 'Verified & Stocked', timestamp: new Date().toLocaleString(), user: 'Current User' }] } } as StockTransfer : t));
           
           // Update Inventory State
           setInventory(prev => {
               const branchId = transfer.targetBranchId;
               const currentBranchStock = [...(prev[branchId] || [])];

               transfer.items.forEach(item => {
                   const existingItemIndex = currentBranchStock.findIndex(i => i.productId === item.productId);
                   
                   if (existingItemIndex >= 0) {
                       // Update existing product
                       currentBranchStock[existingItemIndex].quantity += item.quantity;
                       currentBranchStock[existingItemIndex].batches.push({
                           batchNumber: item.batchNumber,
                           expiryDate: item.expiryDate,
                           quantity: item.quantity
                       });
                   } else {
                       // Add new product entry for branch
                       currentBranchStock.push({
                           productId: item.productId,
                           quantity: item.quantity,
                           batches: [{
                               batchNumber: item.batchNumber,
                               expiryDate: item.expiryDate,
                               quantity: item.quantity
                           }]
                       });
                   }
               });

               return { ...prev, [branchId]: currentBranchStock };
           });
           
           alert("Stock has been successfully verified and added to the active inventory.");
      }
      setShowVerifyModal(false);
  };

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const addShipmentItem = () => {
      if(!shipmentItem.productId || !shipmentItem.quantity) return;
      const product = products.find(p => p.id === shipmentItem.productId);
      if(!product) return;

      setNewShipment(prev => ({
          ...prev,
          items: [...prev.items, {
              productId: product.id,
              productName: product.name,
              batchNumber: shipmentItem.batchNumber || 'BATCH-NEW',
              expiryDate: shipmentItem.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
              quantity: parseInt(shipmentItem.quantity)
          }]
      }));
      setShipmentItem({ productId: '', batchNumber: '', expiryDate: '', quantity: '' });
  };

  const removeShipmentItem = (idx: number) => {
      setNewShipment(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleDispatchShipment = () => {
      const transfer: StockTransfer = {
          id: `TR-${Date.now().toString().slice(-6)}`,
          sourceBranchId: 'HEAD_OFFICE',
          targetBranchId: newShipment.targetBranchId,
          dateSent: new Date().toISOString().split('T')[0],
          items: newShipment.items,
          status: 'IN_TRANSIT',
          keeperCode: generateCode(),
          controllerCode: generateCode(),
          notes: newShipment.notes,
          workflow: {
              step: 'KEEPER_CHECK',
              logs: [{ role: 'Head Office', action: 'Dispatched', timestamp: new Date().toLocaleString(), user: 'Super Admin' }]
          }
      };

      setTransfers([transfer, ...transfers]);
      setShowTransferModal(false);
      setNewShipment({ targetBranchId: '', notes: '', items: [] });
  };

  const handleCreateRequisition = () => {
      alert("Stock Requisition sent to Head Office for Approval.");
      setShowRequestModal(false);
      setNewShipment({ targetBranchId: '', notes: '', items: [] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
             <MapPin size={16} />
             <span>{isHeadOffice ? 'Global Stock View (All Branches)' : `Stock at ${activeBranchName}`}</span>
          </div>
        </div>
        <div className="flex gap-2">
            {isHeadOffice ? (
                <button 
                  onClick={() => setShowTransferModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm shadow-md shadow-blue-600/20"
                >
                    <Send size={16} /> New Shipment
                </button>
            ) : (
                <button 
                  onClick={() => setShowRequestModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm shadow-md shadow-blue-600/20"
                >
                    <FilePlus size={16} /> Request Stock
                </button>
            )}
            <button 
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold text-sm shadow-md shadow-teal-600/20"
            >
                <Plus size={16} /> Add New Stock
            </button>
            <div className="h-8 w-[1px] bg-slate-300 mx-1"></div>
            <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'stock' ? 'bg-white border-teal-600 text-teal-700 border shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                Current Stock
            </button>
            <button 
                onClick={() => setActiveTab('transfers')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'transfers' ? 'bg-white border-teal-600 text-teal-700 border shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                Transfers
                {branchTransfers.filter(t => t.status !== 'COMPLETED').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {branchTransfers.filter(t => t.status !== 'COMPLETED').length}
                    </span>
                )}
            </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                         <DollarSign size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-medium">Total Asset Value (Cost)</p>
                         <h3 className="text-2xl font-bold text-slate-800">
                             {totalAssetValue.toLocaleString()} <span className="text-sm font-normal text-slate-400">TZS</span>
                         </h3>
                     </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                         <TrendingUp size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-medium">Projected Revenue (Retail)</p>
                         <h3 className="text-2xl font-bold text-slate-800">
                             {totalPotentialRevenue.toLocaleString()} <span className="text-sm font-normal text-slate-400">TZS</span>
                         </h3>
                     </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                         <Wallet size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-medium">Potential Gross Profit</p>
                         <h3 className="text-2xl font-bold text-slate-800">
                             {(totalPotentialRevenue - totalAssetValue).toLocaleString()} <span className="text-sm font-normal text-slate-400">TZS</span>
                         </h3>
                     </div>
                 </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input type="text" placeholder="Search inventory..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-xs">
                        <RefreshCcw size={14} /> Sync MSD
                    </button>
                </div>
                <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Info</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing (Unit)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Level</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {displayedInventory.map((product) => {
                    const isLowStock = product.totalStock <= product.minStockLevel;
                    const stockValue = product.totalStock * product.costPrice;
                    const sellingPrice = product.customPrice || product.price;
                    const hasCustomPrice = !!product.customPrice;

                    return (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            <div>
                            <h4 className="font-bold text-slate-800">{product.name}</h4>
                            <p className="text-xs text-slate-500">{product.genericName}</p>
                            <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-1 rounded mt-1 inline-block">{product.category}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <div className="text-xs text-slate-500">
                                    Buy: <span className="font-medium text-slate-700">{product.costPrice.toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    Sell: <span className={`font-bold ${hasCustomPrice ? 'text-blue-600' : 'text-emerald-600'}`}>
                                        {sellingPrice.toLocaleString()}
                                    </span>
                                    {hasCustomPrice && <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Custom</span>}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                                        {product.totalStock}
                                    </span>
                                    <span className="text-xs text-slate-400">{product.unit}s</span>
                                    {isLowStock && <AlertTriangle size={14} className="text-red-500" />}
                                </div>
                                <span className="text-[10px] text-slate-400">Val: {stockValue.toLocaleString()} TZS</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="space-y-1">
                            {product.batches.length > 0 ? product.batches.map((batch, idx) => {
                                const expiry = new Date(batch.expiryDate);
                                const isExpiring = expiry.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days
                                return (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className="font-mono text-slate-500">{batch.batchNumber}</span>
                                    <span className={`flex items-center gap-1 ${isExpiring ? 'text-amber-600 font-bold' : 'text-emerald-600'}`}>
                                        <Calendar size={10} />
                                        {batch.expiryDate}
                                    </span>
                                    <span className="text-slate-400">({batch.quantity})</span>
                                    </div>
                                )
                            }) : <span className="text-xs text-slate-400 italic">No Active Batches</span>}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                            {isHeadOffice ? (
                                <button 
                                  onClick={() => handleViewLog(product)}
                                  className="text-slate-500 border border-slate-200 px-2 py-1 rounded bg-white font-medium hover:text-teal-600 hover:border-teal-200 text-xs flex items-center gap-1 transition-colors shadow-sm"
                                >
                                    <History size={14} /> View History
                                </button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => openAdjustModal(product)}
                                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-medium rounded hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-xs transition-colors shadow-sm text-center"
                                    >
                                        Adjust Stock
                                    </button>
                                    <button 
                                        onClick={() => openPriceModal(product)}
                                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-medium rounded hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-xs transition-colors shadow-sm text-center flex items-center justify-center gap-1"
                                    >
                                        <Tag size={12} /> Set Price
                                    </button>
                                </div>
                            )}
                        </td>
                        </tr>
                    )
                    })}
                </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Transfers Tab Content */}
      {activeTab === 'transfers' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {branchTransfers.length === 0 ? (
                 <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                     <Truck size={48} className="mx-auto text-slate-300 mb-4" />
                     <h3 className="text-lg font-bold text-slate-700">No Transfers Found</h3>
                     <p className="text-slate-500">There are no incoming or outgoing stock transfers for this branch.</p>
                 </div>
             ) : (
                 branchTransfers.map(transfer => {
                     const isComplete = transfer.status === 'COMPLETED';
                     const isReadyForKeeper = transfer.status === 'IN_TRANSIT';
                     const isReadyForController = transfer.status === 'RECEIVED_KEEPER';

                     return (
                         <div key={transfer.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                             <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                                 <div className="flex items-center gap-4">
                                     <div className={`p-3 rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                         {isComplete ? <CheckSquare size={24}/> : <Truck size={24}/>}
                                     </div>
                                     <div>
                                         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                             Transfer #{transfer.id}
                                             {isComplete && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">COMPLETED</span>}
                                             {isReadyForKeeper && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold animate-pulse">IN TRANSIT</span>}
                                             {isReadyForController && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">PENDING VERIFICATION</span>}
                                         </h3>
                                         <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                             <span>From: <strong>{BRANCHES.find(b=>b.id === transfer.sourceBranchId)?.name}</strong></span>
                                             <ArrowRight size={14}/>
                                             <span>To: <strong>{BRANCHES.find(b=>b.id === transfer.targetBranchId)?.name}</strong></span>
                                             <span className="mx-2">•</span>
                                             <span>{transfer.dateSent}</span>
                                         </p>
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-3">
                                     {!isHeadOffice && isReadyForKeeper && (
                                         <button 
                                            onClick={() => initiateVerification(transfer.id, 'KEEPER')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all"
                                         >
                                             <Package size={18} />
                                             <div className="text-left">
                                                 <div className="text-xs opacity-80 uppercase tracking-wide">Step 1: Keeper</div>
                                                 <div>Confirm Receipt</div>
                                             </div>
                                         </button>
                                     )}
                                     
                                     {!isHeadOffice && isReadyForController && (
                                         <button 
                                            onClick={() => initiateVerification(transfer.id, 'CONTROLLER')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-600/20 transition-all"
                                         >
                                             <ClipboardCheck size={18} />
                                             <div className="text-left">
                                                 <div className="text-xs opacity-80 uppercase tracking-wide">Step 2: Controller</div>
                                                 <div>Verify & Stock</div>
                                             </div>
                                         </button>
                                     )}
                                 </div>
                             </div>
                             
                             {/* Head Office View of Verification Codes */}
                             {isHeadOffice && !isComplete && (
                                 <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-sm text-amber-800">
                                          <ShieldCheck size={16} />
                                          <span className="font-bold">Security Codes (Admin View):</span> 
                                          <span>Share these with branch staff to authorize receipt.</span>
                                      </div>
                                      <div className="flex gap-4">
                                          <div className="text-xs">
                                              <span className="text-amber-600 uppercase font-bold mr-1">Keeper Code:</span>
                                              <code className="bg-white px-2 py-1 rounded border border-amber-200 font-mono font-bold text-amber-900">{transfer.keeperCode}</code>
                                          </div>
                                          <div className="text-xs">
                                              <span className="text-amber-600 uppercase font-bold mr-1">Controller Code:</span>
                                              <code className="bg-white px-2 py-1 rounded border border-amber-200 font-mono font-bold text-amber-900">{transfer.controllerCode}</code>
                                          </div>
                                      </div>
                                 </div>
                             )}

                             <div className="p-6">
                                 <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Items in Shipment</h4>
                                 <table className="w-full text-left text-sm">
                                     <thead className="text-slate-400 font-medium border-b border-slate-100">
                                         <tr>
                                             <th className="pb-3 pl-2">Item Name</th>
                                             <th className="pb-3">Batch No</th>
                                             <th className="pb-3">Expiry</th>
                                             <th className="pb-3">Quantity</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                         {transfer.items.map((item, idx) => (
                                             <tr key={idx} className="hover:bg-slate-50">
                                                 <td className="py-3 pl-2 font-medium text-slate-800">{item.productName}</td>
                                                 <td className="py-3 font-mono text-slate-500">{item.batchNumber}</td>
                                                 <td className="py-3 text-slate-600">{item.expiryDate}</td>
                                                 <td className="py-3 font-bold text-teal-700">{item.quantity} units</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                     )
                 })
             )}
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                             <History className="text-teal-600" /> Stock History
                          </h3>
                          <p className="text-slate-500 text-sm">{selectedItem.name} ({selectedItem.genericName})</p>
                      </div>
                      <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  
                  <div className="p-0 overflow-y-auto max-h-[60vh]">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                              <tr>
                                  <th className="px-6 py-3">Date/Time</th>
                                  <th className="px-6 py-3">Action</th>
                                  <th className="px-6 py-3">User</th>
                                  <th className="px-6 py-3 text-right">Qty Change</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {/* Mock History Data */}
                              <tr className="hover:bg-slate-50">
                                  <td className="px-6 py-3 text-slate-600">2023-10-27 10:30</td>
                                  <td className="px-6 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Sale</span></td>
                                  <td className="px-6 py-3 text-slate-500">Grace P (Cashier)</td>
                                  <td className="px-6 py-3 text-right font-bold text-rose-600">-2</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                  <td className="px-6 py-3 text-slate-600">2023-10-26 14:15</td>
                                  <td className="px-6 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">Transfer In</span></td>
                                  <td className="px-6 py-3 text-slate-500">Juma M (Manager)</td>
                                  <td className="px-6 py-3 text-right font-bold text-emerald-600">+100</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                  <td className="px-6 py-3 text-slate-600">2023-10-20 09:00</td>
                                  <td className="px-6 py-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">Adjustment</span></td>
                                  <td className="px-6 py-3 text-slate-500">Sarah K (Admin)</td>
                                  <td className="px-6 py-3 text-right font-bold text-rose-600">-1 (Damaged)</td>
                              </tr>
                              <tr className="hover:bg-slate-50">
                                  <td className="px-6 py-3 text-slate-600">2023-10-01 08:00</td>
                                  <td className="px-6 py-3"><span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs font-bold">Initial Stock</span></td>
                                  <td className="px-6 py-3 text-slate-500">System</td>
                                  <td className="px-6 py-3 text-right font-bold text-emerald-600">+50</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
                      Showing last 4 transactions for this item across all active batches.
                  </div>
              </div>
          </div>
      )}

      {/* Add Stock Modal - Unchanged */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-xl font-bold text-slate-900">Add New Stock</h3>
                          <p className="text-slate-500 text-sm">Enter stock details for {activeBranchName}</p>
                      </div>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      {/* Form Body - Reusing logic for brevity */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Product</label>
                           <select className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={newStock.productId} onChange={(e) => setNewStock({...newStock, productId: e.target.value})}>
                               <option value="">-- Choose Product --</option>
                               {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.genericName})</option>)}
                           </select>
                      </div>
                      <div>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch Number</label>
                                   <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono" placeholder="BATCH-001" value={newStock.batchNumber} onChange={e => setNewStock({...newStock, batchNumber: e.target.value})} />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                                   <input type="date" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={newStock.expiryDate} onChange={e => setNewStock({...newStock, expiryDate: e.target.value})} />
                               </div>
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity to Add</label>
                               <input type="number" className="w-full p-3 border border-slate-300 rounded-lg font-bold text-lg" placeholder="0" value={newStock.quantity} onChange={e => setNewStock({...newStock, quantity: e.target.value})} />
                           </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                      <button onClick={handleSaveStock} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700">Save to Inventory</button>
                  </div>
              </div>
          </div>
      )}

      {/* Shipment / Request Modal */}
      {(showTransferModal || showRequestModal) && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                             {showRequestModal ? <FilePlus className="text-blue-600" /> : <Truck className="text-blue-600" />}
                             {showRequestModal ? "Request Stock from HQ" : "Initiate Stock Transfer"}
                          </h3>
                          <p className="text-slate-500 text-sm">{showRequestModal ? "Submit a requisition for approval" : "Send stock from Head Office to a Branch"}</p>
                      </div>
                      <button onClick={() => { setShowTransferModal(false); setShowRequestModal(false); }} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Branch Selection (Only for HO Shipment) */}
                      {!showRequestModal && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Destination Branch</label>
                          <select 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newShipment.targetBranchId}
                            onChange={(e) => setNewShipment({...newShipment, targetBranchId: e.target.value})}
                          >
                              <option value="">-- Select Target Branch --</option>
                              {BRANCHES.filter(b => b.id !== 'HEAD_OFFICE' && b.status === 'ACTIVE').map(b => (
                                  <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                              ))}
                          </select>
                        </div>
                      )}

                      {/* Add Items Section */}
                      <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-3">Items</h4>
                          <div className="grid grid-cols-12 gap-3 mb-3">
                              <div className="col-span-4">
                                  <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                    value={shipmentItem.productId}
                                    onChange={(e) => setShipmentItem({...shipmentItem, productId: e.target.value})}
                                  >
                                      <option value="">Product...</option>
                                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                  </select>
                              </div>
                              <div className="col-span-3">
                                  {/* For Requisitions, we don't know batch numbers yet */}
                                  {!showRequestModal ? (
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono" 
                                        placeholder="Batch No."
                                        value={shipmentItem.batchNumber}
                                        onChange={(e) => setShipmentItem({...shipmentItem, batchNumber: e.target.value})}
                                    />
                                  ) : (
                                    <div className="p-2 text-xs text-slate-400 italic bg-slate-50 rounded border border-slate-100">Any Batch</div>
                                  )}
                              </div>
                              <div className="col-span-3">
                                  {!showRequestModal ? (
                                    <input 
                                        type="date" 
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                        value={shipmentItem.expiryDate}
                                        onChange={(e) => setShipmentItem({...shipmentItem, expiryDate: e.target.value})}
                                    />
                                  ) : (
                                    <div className="p-2 text-xs text-slate-400 italic bg-slate-50 rounded border border-slate-100">Valid Date</div>
                                  )}
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                    placeholder="Qty"
                                    value={shipmentItem.quantity}
                                    onChange={(e) => setShipmentItem({...shipmentItem, quantity: e.target.value})}
                                  />
                                  <button 
                                    onClick={addShipmentItem}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                  >
                                      <Plus size={16} />
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Items List */}
                      {newShipment.items.length > 0 ? (
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                      <tr>
                                          <th className="px-4 py-2">Product</th>
                                          {!showRequestModal && <th className="px-4 py-2">Batch</th>}
                                          <th className="px-4 py-2">Qty</th>
                                          <th className="px-4 py-2 w-10"></th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {newShipment.items.map((item, idx) => (
                                          <tr key={idx} className="bg-white">
                                              <td className="px-4 py-2 font-medium">{item.productName}</td>
                                              {!showRequestModal && <td className="px-4 py-2 font-mono text-slate-500">{item.batchNumber}</td>}
                                              <td className="px-4 py-2 font-bold">{item.quantity}</td>
                                              <td className="px-4 py-2">
                                                  <button onClick={() => removeShipmentItem(idx)} className="text-rose-500 hover:text-rose-700">
                                                      <Trash2 size={16} />
                                                  </button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      ) : (
                          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                              No items added yet.
                          </div>
                      )}

                      {/* Notes */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes</label>
                          <textarea 
                             className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                             rows={2}
                             placeholder={showRequestModal ? "Reason for request (e.g. Critical Low Stock)..." : "Instructions for receiver..."}
                             value={newShipment.notes}
                             onChange={(e) => setNewShipment({...newShipment, notes: e.target.value})}
                          ></textarea>
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => { setShowTransferModal(false); setShowRequestModal(false); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
                      
                      {showRequestModal ? (
                           <button 
                             onClick={handleCreateRequisition}
                             disabled={newShipment.items.length === 0}
                             className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                           >
                               <Send size={18} /> Submit Request
                           </button>
                      ) : (
                           <button 
                             onClick={handleDispatchShipment}
                             disabled={!newShipment.targetBranchId || newShipment.items.length === 0}
                             className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                           >
                               <Send size={18} /> Dispatch Shipment
                           </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Verification Modal (OTP) */}
      {showVerifyModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                   <div className="p-6 border-b border-slate-100 text-center">
                       <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                           <KeyRound className="text-teal-600" size={24} />
                       </div>
                       <h3 className="text-lg font-bold text-slate-900">Security Verification</h3>
                       <p className="text-slate-500 text-xs mt-1">
                           Enter the 6-digit verification code sent by Head Office to {verifyStep === 'KEEPER' ? 'Store Keeper' : 'Inventory Controller'}.
                       </p>
                   </div>
                   
                   <div className="p-6 space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-center">Verification Code</label>
                           <input 
                               type="text" 
                               autoFocus
                               maxLength={6}
                               className="w-full p-4 border border-slate-300 rounded-xl text-2xl font-mono text-center tracking-widest focus:ring-2 focus:ring-teal-500 outline-none" 
                               placeholder="000000"
                               value={verificationCode}
                               onChange={(e) => {
                                   setVerifyError('');
                                   setVerificationCode(e.target.value.replace(/[^0-9]/g, ''));
                               }}
                           />
                       </div>
                       
                       {verifyError && (
                           <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-lg text-center flex items-center justify-center gap-2">
                               <AlertTriangle size={14} /> {verifyError}
                           </div>
                       )}
                   </div>

                   <div className="p-4 border-t border-slate-100 flex justify-between gap-3 bg-slate-50">
                       <button onClick={() => setShowVerifyModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm">Cancel</button>
                       <button 
                           onClick={submitVerification}
                           disabled={verificationCode.length !== 6}
                           className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           Verify & Proceed
                       </button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Inventory;
