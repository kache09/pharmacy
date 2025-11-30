
import React, { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Minus, CreditCard, Banknote, ShieldCheck, Printer, CheckCircle, AlertOctagon } from 'lucide-react';
import { Product, CartItem, PaymentMethod, BranchInventoryItem, Sale } from '../types';
import { checkDrugInteractions } from '../services/geminiService';
import { BRANCHES, PRODUCTS } from '../data/mockData';

interface POSProps {
  currentBranchId: string;
  inventory: Record<string, BranchInventoryItem[]>;
  setInventory: React.Dispatch<React.SetStateAction<Record<string, BranchInventoryItem[]>>>;
  onRecordSale: (sale: Sale) => void;
}

const POS: React.FC<POSProps> = ({ currentBranchId, inventory, setInventory, onRecordSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [interactionWarning, setInteractionWarning] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const isHeadOffice = currentBranchId === 'HEAD_OFFICE';
  const branchName = BRANCHES.find(b => b.id === currentBranchId)?.name;

  // Merge Products with Branch Specific Inventory (LIVE from Props)
  const availableProducts: Product[] = PRODUCTS.map(p => {
    const branchStockList = inventory[currentBranchId] || [];
    const inventoryItem = branchStockList.find(i => i.productId === p.id);
    const customPrice = inventoryItem?.customPrice;

    return {
      ...p,
      price: customPrice || p.price, // Override with custom price if exists
      totalStock: inventoryItem ? inventoryItem.quantity : 0 // Show ONLY approved stock
    };
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const vat = subtotal * 0.18; // Tanzania VAT 18%
  const total = subtotal + vat;

  useEffect(() => {
    // Debounced interaction check
    const timer = setTimeout(async () => {
      if (cart.length > 1) {
        const warning = await checkDrugInteractions(cart);
        if (warning && warning.toLowerCase() !== "safe") {
          setInteractionWarning(warning);
        } else {
          setInteractionWarning(null);
        }
      } else {
        setInteractionWarning(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart]);

  const addToCart = (product: Product) => {
    // Check if enough stock
    const currentQtyInCart = cart.find(i => i.id === product.id)?.quantity || 0;
    if (currentQtyInCart + 1 > product.totalStock) {
        alert("Insufficient stock in inventory.");
        return;
    }

    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1, selectedBatch: 'BATCH-AUTO', discount: 0 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
        const item = prev.find(i => i.id === id);
        if (!item) return prev;
        
        // Find actual product stock
        const product = availableProducts.find(p => p.id === id);
        if (!product) return prev;

        const newQty = item.quantity + delta;

        if (newQty > product.totalStock) {
            alert("Cannot add more. Exceeds available stock.");
            return prev;
        }

        if (newQty < 1) return prev; // Use remove button for deletion

        return prev.map(p => p.id === id ? { ...p, quantity: newQty } : p);
    });
  };

  const handleCheckout = (method: PaymentMethod) => {
    setPaymentModalOpen(false);

    // 1. Create Sale Record
    const sale: Sale = {
        id: `SALE-${Date.now()}`,
        date: new Date().toISOString(),
        branchId: currentBranchId,
        items: cart,
        totalAmount: total,
        totalCost: totalCost,
        profit: subtotal - totalCost, // Net Profit (Excluding VAT)
        paymentMethod: method,
        status: 'COMPLETED'
    };

    onRecordSale(sale);

    // 2. Deduct from Global Inventory
    setInventory(prev => {
        const branchStock = [...(prev[currentBranchId] || [])];
        
        cart.forEach(cartItem => {
            const index = branchStock.findIndex(i => i.productId === cartItem.id);
            if (index !== -1) {
                // Deduct total quantity
                branchStock[index].quantity = Math.max(0, branchStock[index].quantity - cartItem.quantity);
                
                // Deduct from batches (FIFO Logic - simplified)
                let remainingToDeduct = cartItem.quantity;
                const updatedBatches = branchStock[index].batches.map(batch => {
                     if (remainingToDeduct <= 0) return batch;
                     
                     if (batch.quantity >= remainingToDeduct) {
                         const newBatchQty = batch.quantity - remainingToDeduct;
                         remainingToDeduct = 0;
                         return { ...batch, quantity: newBatchQty };
                     } else {
                         remainingToDeduct -= batch.quantity;
                         return { ...batch, quantity: 0 };
                     }
                }).filter(b => b.quantity > 0); // Remove empty batches

                branchStock[index].batches = updatedBatches;
            }
        });

        return { ...prev, [currentBranchId]: branchStock };
    });

    setSuccessMsg(`Sale Completed! Profit: ${(subtotal - totalCost).toLocaleString()} TZS. TRA Receipt Generated.`);
    setCart([]);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const filteredProducts = availableProducts.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.genericName.toLowerCase().includes(searchTerm.toLowerCase()))
    && p.totalStock > 0 // Hide out of stock items in POS list for cleaner UI
  );

  if (isHeadOffice) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-6 bg-amber-50 rounded-full mb-4">
                  <AlertOctagon size={48} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">POS Unavailable in Head Office View</h2>
              <p className="text-slate-500 max-w-md mb-6">
                  Point of Sale operations must be conducted within a specific branch context. Please switch to a branch using the selector in the sidebar to open the register.
              </p>
          </div>
      )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Scan Barcode or Search Product..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col text-left p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="flex justify-between w-full mb-2">
                  <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-md">{product.unit}</span>
                  {product.requiresPrescription && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">Rx</span>}
                </div>
                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-teal-700">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{product.genericName}</p>
                <div className="mt-auto pt-2 border-t border-slate-100 w-full flex justify-between items-center">
                   <div className="flex flex-col">
                       <span className="font-bold text-slate-900">{(product.price).toLocaleString()} TZS</span>
                       <span className="text-[10px] text-slate-400">Stock: {product.totalStock}</span>
                   </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="w-96 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Printer className="mr-2" size={20}/>
            Current Sale
          </h2>
          <p className="text-xs text-teal-600 font-bold mt-1">Location: {branchName}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCartIcon size={48} className="mb-4 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900">{(item.price * item.quantity).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus size={14}/></button>
                     <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus size={14}/></button>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Warning Section */}
        {interactionWarning && (
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
             <div className="flex items-start gap-2 text-amber-800 text-xs">
               <ShieldCheck size={16} className="shrink-0 mt-0.5" />
               <p><strong>Clinical Alert:</strong> {interactionWarning}</p>
             </div>
          </div>
        )}

        {/* Totals & Action */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT (18%)</span>
              <span>{vat.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-teal-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>{total.toLocaleString()} TZS</span>
            </div>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => setPaymentModalOpen(true)}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex justify-center items-center gap-2"
          >
            Process Payment
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100">
                 <h3 className="text-xl font-bold text-slate-900">Select Payment Method</h3>
                 <p className="text-slate-500 text-sm">Total Due: <span className="font-bold text-teal-600">{total.toLocaleString()} TZS</span></p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                 <PaymentButton icon={Banknote} label="Cash" onClick={() => handleCheckout(PaymentMethod.CASH)} />
                 <PaymentButton icon={CreditCard} label="M-Pesa / Tigo" sub="Mobile Money" onClick={() => handleCheckout(PaymentMethod.MOBILE_MONEY)} />
                 <PaymentButton icon={ShieldCheck} label="NHIF / AAR" sub="Insurance" onClick={() => handleCheckout(PaymentMethod.INSURANCE)} />
                 <PaymentButton icon={CreditCard} label="Credit" sub="Corporate" onClick={() => handleCheckout(PaymentMethod.CREDIT)} />
              </div>
              <div className="p-4 bg-slate-50 text-center">
                 <button onClick={() => setPaymentModalOpen(false)} className="text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-8 right-8 bg-teal-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300">
           <CheckCircle className="text-teal-400" />
           <div>
             <h4 className="font-bold">Success</h4>
             <p className="text-sm text-teal-100">{successMsg}</p>
           </div>
        </div>
      )}
    </div>
  );
};

const PaymentButton = ({ icon: Icon, label, sub, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-500 transition-all">
    <Icon size={32} className="text-teal-600 mb-2" />
    <span className="font-bold text-slate-800">{label}</span>
    {sub && <span className="text-xs text-slate-400">{sub}</span>}
  </button>
)

const ShoppingCartIcon = ({size, className}: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
)

export default POS;
