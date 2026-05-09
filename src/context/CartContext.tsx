'use client';
import React,{createContext,useContext,useEffect,useMemo,useState}from'react';
import{useProducts,type ManagedProduct,getVariantPrice}from'@/context/ProductContext';
import{supabase}from'@/lib/supabase';
import type{SizeOption,ConcentrationOption}from'@/data/products';
type Raw={productId:string;size:SizeOption;concentration:ConcentrationOption;quantity:number};type Line=Raw&{key:string;product:ManagedProduct;unitPrice:number;lineTotal:number};
type Cart={items:Line[];itemCount:number;subtotal:number;cartOpen:boolean;setCartOpen:(v:boolean)=>void;addToCart:(id:string,size:SizeOption,concentration:ConcentrationOption,q?:number)=>Promise<boolean>;updateQuantity:(key:string,q:number)=>void;removeFromCart:(key:string)=>void;clearCart:()=>void};
const C=createContext<Cart|undefined>(undefined);const makeKey=(id:string,size:SizeOption,concentration:ConcentrationOption)=>`${id}__${size}__${concentration}`;
export function CartProvider({children}:{children:React.ReactNode}){const{activeProducts}=useProducts();const[raw,setRaw]=useState<Raw[]>([]);const[cartOpen,setCartOpen]=useState(false);useEffect(()=>{try{const s=localStorage.getItem('perfumestore-cart-v4');if(s)setRaw(JSON.parse(s))}catch{}},[]);useEffect(()=>{localStorage.setItem('perfumestore-cart-v4',JSON.stringify(raw))},[raw]);const items=useMemo(()=>raw.map(l=>{const p=activeProducts.find(x=>x.id===l.productId);if(!p)return null;const unitPrice=getVariantPrice(p,l.size,l.concentration);return {...l,key:makeKey(l.productId,l.size,l.concentration),product:p,unitPrice,lineTotal:unitPrice*l.quantity}}).filter(Boolean)as Line[],[raw,activeProducts]);const itemCount=items.reduce((s,i)=>s+i.quantity,0);const subtotal=items.reduce((s,i)=>s+i.lineTotal,0);const addToCart=async(id:string,size:SizeOption,concentration:ConcentrationOption,q=1)=>{
  try{
    if(!supabase){
      const redirect=encodeURIComponent(window.location.pathname+window.location.search);
      window.location.href=`/account?loginRequired=1&redirect=${redirect}`;
      return false;
    }
    const {data}=await supabase.auth.getUser();
    if(!data.user){
      const redirect=encodeURIComponent(window.location.pathname+window.location.search);
      window.location.href=`/account?loginRequired=1&redirect=${redirect}`;
      return false;
    }
  }catch{
    const redirect=encodeURIComponent(window.location.pathname+window.location.search);
    window.location.href=`/account?loginRequired=1&redirect=${redirect}`;
    return false;
  }
  setRaw(cur=>{const e=cur.find(i=>makeKey(i.productId,i.size,i.concentration)===makeKey(id,size,concentration));return e?cur.map(i=>makeKey(i.productId,i.size,i.concentration)===makeKey(id,size,concentration)?{...i,quantity:Math.min(i.quantity+q,99)}:i):[...cur,{productId:id,size,concentration,quantity:q}]});
  setCartOpen(true);
  return true;
};const updateQuantity=(key:string,q:number)=>setRaw(cur=>q<=0?cur.filter(i=>makeKey(i.productId,i.size,i.concentration)!==key):cur.map(i=>makeKey(i.productId,i.size,i.concentration)===key?{...i,quantity:Math.min(q,99)}:i));const removeFromCart=(key:string)=>setRaw(cur=>cur.filter(i=>makeKey(i.productId,i.size,i.concentration)!==key));const clearCart=()=>setRaw([]);return <C.Provider value={{items,itemCount,subtotal,cartOpen,setCartOpen,addToCart,updateQuantity,removeFromCart,clearCart}}>{children}</C.Provider>}
export function useCart(){const c=useContext(C);if(!c)throw new Error('useCart must be used inside CartProvider');return c}
