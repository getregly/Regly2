import { useRouter } from 'next/router'

export default function MerchantTerms() {
  const router = useRouter()

  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap'); *{box-sizing:border-box;}`}</style>

      <nav style={{background:'white', borderBottom:'1px solid #F3F4F6', padding:'0 24px'}}>
        <div style={{maxWidth:800, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64}}>
          <button onClick={() => router.push('/')}
            style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#1A0A06', background:'none', border:'none', cursor:'pointer'}}>
            <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontStyle:"italic",fontSize:"inherit",letterSpacing:"-0.01em"}}>Regly</span>
          </button>
          <button onClick={() => window.close()}
            style={{display:'flex', alignItems:'center', gap:6, color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', fontSize:14, fontFamily:'inherit'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Close
          </button>
        </div>
      </nav>

      <div style={{maxWidth:800, margin:'0 auto', padding:'48px 24px 80px'}}>
        <div style={{marginBottom:40}}>
          <p style={{fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:600, color:'#C0442B', marginBottom:8}}>Legal</p>
          <h1 style={{fontFamily:'Georgia, serif', fontSize:32, fontWeight:700, color:'#1A0A06', marginBottom:8}}>Merchant Agreement</h1>
          <p style={{color:'#9CA3AF', fontSize:14}}>Last updated: April 2026</p>
        </div>

        <div style={{background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:12, padding:'16px 20px', marginBottom:40}}>
          <p style={{fontSize:14, color:'#92400E', lineHeight:1.6, margin:0}}>
            <strong>Plain English Summary:</strong> Regly processes membership payments from your customers and sends you 85% of every dollar collected, monthly via Stripe. We charge 15% as our platform fee. You set your own perks and pricing. Either party can cancel at any time.
          </p>
        </div>

        {[
          {
            n:'1', title:'The Parties',
            body:`This Merchant Agreement ("Agreement") is between Regly ("Regly," "we," "us," or "our") and the business owner ("Merchant," "you," or "your") who signs up to use the Regly platform at getregly.com.

By completing the merchant onboarding form and checking the agreement box, you agree to be bound by these terms.`
          },
          {
            n:'2', title:'What Regly Provides',
            body:`Regly provides a membership platform that allows your customers to subscribe to monthly membership tiers you define. Regly is responsible for:

• Processing all customer payments securely through Stripe
• Maintaining the customer-facing membership dashboard at getregly.com
• Providing your business dashboard for member lookup and management
• Transferring your earnings to your Stripe account on a monthly basis
• Providing basic platform support via getregly@gmail.com`
          },
          {
            n:'3', title:'Revenue Split & Payment Terms',
            body:`For every membership subscription processed through the Regly platform:

• You receive 85% of the gross subscription amount
• Regly retains 15% as a platform fee
• Payments are transferred to your connected Stripe account on a monthly basis
• Regly does not charge any setup fees, monthly SaaS fees, or hardware costs
• The 15% platform fee is Regly\'s only compensation, there are no hidden charges

Example: A customer subscribes to your $20/month tier. You receive $17.00. Regly retains $3.00. Stripe\'s processing fee (2.9% + $0.30) is deducted from Regly\'s portion.`
          },
          {
            n:'4', title:'Your Responsibilities as a Merchant',
            body:`By joining Regly, you agree to:

• Honor all membership perks you define for each tier, as stated on the platform
• Train relevant staff to use the Regly member lookup tool to verify memberships
• Maintain accurate and truthful descriptions of your business and membership benefits
• Not modify perks in a way that materially diminishes the value to existing subscribers without reasonable notice
• Comply with all applicable local, state, and federal laws in operating your business
• Maintain a connected Stripe account to receive payouts`
          },
          {
            n:'5', title:'Customer Subscriptions & Cancellations',
            body:`Your customers subscribe directly through Regly and may cancel their membership at any time from their customer dashboard. When a customer cancels:

• Their membership remains active until the end of the current billing period
• No refunds are issued for partial months
• You will see cancellation dates reflected in your business dashboard in real time

Regly does not issue refunds on behalf of merchants. If a customer disputes a charge with their bank, Stripe\'s standard dispute process applies.`
          },
          {
            n:'6', title:'Merchant Cancellation',
            body:`You may cancel your participation in Regly at any time by contacting us at getregly@gmail.com.

Upon cancellation:
• No new customer subscriptions will be accepted for your business
• Existing active subscriber memberships will continue until their current billing period ends
• You will continue to receive payouts for any revenue collected during active subscription periods
• Your business listing will be removed from the Regly platform within 48 hours of cancellation confirmation`
          },
          {
            n:'7', title:'Regly\'s Right to Remove a Merchant',
            body:`Regly reserves the right to suspend or remove a merchant from the platform if:

• The merchant materially fails to honor membership perks owed to subscribers
• The merchant\'s business is found to be operating illegally or in violation of applicable laws
• The merchant engages in fraudulent activity on the platform
• The merchant\'s Stripe account becomes invalid or unable to receive payments

In such cases, Regly will provide written notice via email and a reasonable opportunity to resolve the issue before removal, except in cases of fraud or illegal activity.`
          },
          {
            n:'8', title:'Intellectual Property',
            body:`You retain full ownership of your business name, brand, and any content you provide to Regly. By submitting this content, you grant Regly a limited license to display it on the platform for the purpose of operating the service.

Regly retains ownership of the Regly platform, technology, and brand.`
          },
          {
            n:'9', title:'Limitation of Liability',
            body:`Regly is a technology platform and is not responsible for:

• The quality or delivery of goods or services provided by merchants to their customers
• Disputes between merchants and their customers regarding perk fulfillment
• Loss of revenue due to platform downtime, provided Regly makes reasonable efforts to maintain availability
• Actions taken by Stripe, including payment delays or account holds

To the maximum extent permitted by law, Regly\'s total liability to any merchant shall not exceed the total platform fees paid to Regly by that merchant in the 3 months preceding the claim.`
          },
          {
            n:'10', title:'Modifications to These Terms',
            body:`Regly may update these terms from time to time. When we do, we will notify active merchants via email at least 14 days before changes take effect. Your continued use of the Regly platform after that date constitutes acceptance of the updated terms.

If you do not agree to updated terms, you may cancel your merchant account before the effective date at no penalty.`
          },
          {
            n:'11', title:'Governing Law',
            body:`These terms are governed by the laws of the State of Illinois. Any disputes arising from this agreement shall be resolved in the courts of Cook County, Illinois.`
          },
          {
            n:'12', title:'Contact',
            body:`For questions about this agreement or your merchant account, contact us at:

Regly
getregly@gmail.com
getregly.com`
          },
        ].map(section => (
          <div key={section.n} style={{marginBottom:36}}>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color:'#1A0A06', marginBottom:12}}>
              {section.n}. {section.title}
            </h2>
            <div style={{background:'white', borderRadius:12, padding:'20px 24px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
              {section.body.split('\n').map((line, i) => (
                <p key={i} style={{
                  fontSize:14,
                  color: line.startsWith('•') ? '#374151' : '#4B5563',
                  lineHeight:1.7,
                  margin: line === '' ? '0 0 8px' : '0 0 4px',
                  paddingLeft: line.startsWith('•') ? 8 : 0,
                }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        <div style={{textAlign:'center', paddingTop:32, borderTop:'1px solid #F3F4F6'}}>
          <p style={{color:'#9CA3AF', fontSize:13}}>Questions? Email us at <span style={{color:'#C0442B'}}>getregly@gmail.com</span></p>
          <button onClick={() => router.push('/auth?role=business')}
            style={{marginTop:16, padding:'12px 32px', background:'#1A0A06', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
            Apply to Join Regly
          </button>
        </div>
      </div>
    </div>
  )
}
