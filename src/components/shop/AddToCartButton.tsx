'use client';
import type{ReactNode}from'react';
import{useCart}from'@/context/CartContext';
import type{SizeOption,ConcentrationOption}from'@/data/products';
export default function AddToCartButton({productId,size='10ml',concentration='EDP',className='',children='Add to Cart'}:{productId:string;size?:SizeOption;concentration?:ConcentrationOption;className?:string;children?:ReactNode}){const{addToCart}=useCart();return <button onClick={()=>addToCart(productId,size,concentration)} className={className||'rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800'}>{children}</button>}
