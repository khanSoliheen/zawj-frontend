// // components/PaywallSheet.tsx
// import React, { useState } from 'react';
// import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
// import { supabase } from '../lib/supabase';
// import { openUpiIntent } from '../lib/upi';
// import { v4 as uuidv4 } from 'uuid';

// type Props = {
//   userId: string;
//   vpa: string;              // your merchant/personal VPA
//   onAskUTR: (purchaseId: string, amount: number) => void; // open UTR modal
//   onClose?: () => void;
// };

// async function createPurchase({
//   userId, sku, amount,
// }: { userId: string; sku: 'TOPUP_3' | 'TOPUP_60'; amount: number; }) {
//   const idempotency_key = uuidv4();
//   const { data, error } = await supabase
//     .from('purchases')
//     .insert([{
//       id: uuidv4(),
//       user_id: userId,
//       sku,
//       amount_inr: amount,
//       status: 'pending',
//       idempotency_key,
//     }])
//     .select()
//     .single();

//   if (error) throw error;
//   return data; // { id, ... }
// }

// export default function PaywallSheet({ userId, vpa, onAskUTR, onClose }: Props) {
//   const [loading, setLoading] = useState<null | number>(null);

//   const startBuy = async (sku: 'TOPUP_3' | 'TOPUP_60', amount: number) => {
//     try {
//       setLoading(amount);
//       // 1) create pending purchase
//       const p = await createPurchase({ userId, sku, amount });
//       // 2) open UPI intent
//       await openUpiIntent({ vpa, name: 'Your App', amount, note: sku === 'TOPUP_3' ? '+3 credits' : '+60 credits' });
//       // 3) ask user to enter UTR
//       onAskUTR(p.id, amount);
//     } catch (e: any) {
//       Alert.alert('Payment error', e.message ?? 'Could not start purchase.');
//     } finally {
//       setLoading(null);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>You have 0 credits</Text>
//       <Text style={{ color: '#666', marginBottom: 16 }}>
//         Get <Text style={{ fontWeight: '700' }}>+3 credits for ₹10</Text> or <Text style={{ fontWeight: '700' }}>+60 credits for ₹100</Text>.
//       </Text>

//       <Pressable
//         onPress={() => startBuy('TOPUP_3', 10)}
//         style={{ backgroundColor: '#111', padding: 14, borderRadius: 10, marginBottom: 10, opacity: loading === 10 ? 0.7 : 1 }}
//         disabled={!!loading}
//       >
//         {loading === 10 ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', textAlign: 'center' }}>₹10 → +3 credits</Text>}
//       </Pressable>

//       <Pressable
//         onPress={() => startBuy('TOPUP_60', 100)}
//         style={{ backgroundColor: '#111', padding: 14, borderRadius: 10, marginBottom: 10, opacity: loading === 100 ? 0.7 : 1 }}
//         disabled={!!loading}
//       >
//         {loading === 100 ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', textAlign: 'center' }}>₹100 → +60 credits</Text>}
//       </Pressable>

//       <Pressable onPress={onClose} style={{ padding: 12 }}>
//         <Text style={{ textAlign: 'center' }}>Maybe later</Text>
//       </Pressable>
//     </View>
//   );
// }
