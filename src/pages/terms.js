import { useRouter } from 'next/router'

export default function Terms() {
  const router = useRouter()

  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap'); *{box-sizing:border-box;}`}</style>

      <nav style={{background:'white', borderBottom:'1px solid #F3F4F6', padding:'0 24px'}}>
        <div style={{maxWidth:800, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64}}>
          <button onClick={() => router.push('/')}
            style={{fontFamily:'Georgia, serif', fontSize:20, fontWeight:700, color:'#111827', background:'none', border:'none', cursor:'pointer'}}>
            REGL<span style={{color:'#C9A84C'}}>Y</span>
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
          <p style={{fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:600, color:'#C9A84C', marginBottom:8}}>Legal</p>
          <h1 style={{fontFamily:'Georgia, serif', fontSize:32, fontWeight:700, color:'#111827', marginBottom:8}}>Customer Terms of Service</h1>
          <p style={{color:'#9CA3AF', fontSize:14}}>Last updated: April 2026</p>
        </div>

        <div style={{background:'#F0FDF4', border:'1px solid #6EE7B7', borderRadius:12, padding:'16px 20px', marginBottom:40}}>
          <p style={{fontSize:14, color:'#065F46', lineHeight:1.6, margin:0}}>
            <strong>Plain English Summary:</strong> You pay a monthly fee to access perks at local businesses on Regly. You get your perks every visit from day one. Cancel anytime. Regly is a platform — the business is responsible for delivering your perks.
          </p>
        </div>

        {[
          {
            n:'1', title:'What Regly Is',
            body:`Regly is a membership platform that connects customers with local businesses through monthly subscription tiers. When you subscribe to a business on Regly, you pay a recurring monthly fee in exchange for defined perks at that business — such as free items, discounts, or free deliveries — every time you visit.

Regly is a technology platform. We are not the business providing your perks. The local business you subscribe to is responsible for honoring the membership benefits they have defined.`
          },
          {
            n:'2', title:'Subscriptions & Billing',
            body:`When you subscribe to a membership tier on Regly:

• Your payment method is charged the membership fee immediately upon subscribing
• Your subscription automatically renews each month on your billing date
• You will receive the defined perks for that tier on every qualifying visit during your active membership period
• All payments are processed securely through Stripe`
          },
          {
            n:'3', title:'Cancellations & Refunds',
            body:`You may cancel your membership at any time from your Regly customer dashboard. There are no cancellation fees.

When you cancel:
• Your membership remains active until the end of your current billing period
• You will not be charged for the following month
• No partial refunds are issued for the unused portion of a billing period

If you believe you have been charged incorrectly, contact us at getregly@gmail.com within 30 days of the charge.`
          },
          {
            n:'4', title:'How Perks Work',
            body:`Your membership perks are defined by the business and displayed clearly before you subscribe. To redeem your perks:

• Simply give your phone number at the counter when you visit
• Staff will look up your membership and apply your perks
• Perks reset each billing cycle — you receive your full benefits on every visit throughout your membership period

Regly is not responsible if a business fails to honor your perks. If a business consistently fails to deliver your benefits, contact us at getregly@gmail.com and we will investigate.`
          },
          {
            n:'5', title:'Your Account',
            body:`To use Regly you must create an account with a valid email address and phone number. You are responsible for keeping your account credentials secure. Your phone number is used to verify your membership at participating businesses — please keep it accurate and up to date in your dashboard.`
          },
          {
            n:'6', title:'Acceptable Use',
            body:`You agree not to:

• Share your membership with others or allow others to use your phone number to claim your perks
• Attempt to manipulate or abuse the Regly platform or any participating business
• Provide false information when creating your account

Regly reserves the right to suspend or terminate accounts that violate these terms.`
          },
          {
            n:'7', title:'Limitation of Liability',
            body:`Regly is a technology platform that facilitates memberships between customers and local businesses. We are not responsible for:

• The quality, availability, or delivery of goods or services provided by participating businesses
• A business closing, changing ownership, or discontinuing their Regly membership program
• Temporary platform downtime or service interruptions

If a business closes or leaves Regly, any active subscriptions to that business will be cancelled and you will not be charged for the following billing period.`
          },
          {
            n:'8', title:'Modifications to These Terms',
            body:`Regly may update these terms from time to time. We will notify you via email at least 14 days before any material changes take effect. Your continued use of Regly after that date constitutes acceptance of the updated terms.`
          },
          {
            n:'9', title:'Governing Law',
            body:`These terms are governed by the laws of the State of Illinois. Any disputes arising from this agreement shall be resolved in the courts of Cook County, Illinois.`
          },
          {
            n:'10', title:'Contact',
            body:`For questions about your membership or these terms, contact us at:

Regly
getregly@gmail.com
getregly.com`
          },
        ].map(section => (
          <div key={section.n} style={{marginBottom:36}}>
            <h2 style={{fontFamily:'Georgia, serif', fontSize:18, fontWeight:700, color:'#111827', marginBottom:12}}>
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

        <div style={{marginBottom:32, padding:'20px 24px', background:'white', borderRadius:12, boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
          <p style={{fontSize:13, color:'#9CA3AF', margin:0}}>
            Are you a business owner?{' '}
            <a href="/merchant-terms" target="_blank" style={{color:'#C9A84C', fontWeight:500, textDecoration:'none'}}>
              View the Merchant Agreement
            </a>
          </p>
        </div>

        <div style={{textAlign:'center', paddingTop:32, borderTop:'1px solid #F3F4F6'}}>
          <p style={{color:'#9CA3AF', fontSize:13}}>Questions? Email us at <span style={{color:'#C9A84C'}}>getregly@gmail.com</span></p>
          <button onClick={() => router.push('/auth?role=customer')}
            style={{marginTop:16, padding:'12px 32px', background:'#111827', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
            Browse Memberships
          </button>
        </div>
      </div>
    </div>
  )
}
