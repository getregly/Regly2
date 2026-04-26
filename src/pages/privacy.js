import { useRouter } from 'next/router'

export default function Privacy() {
  const router = useRouter()

  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', fontFamily:"'Inter', system-ui, sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;}`}</style>

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
          <h1 style={{fontFamily:'Georgia, serif', fontSize:32, fontWeight:700, color:'#1A0A06', marginBottom:8}}>Privacy Policy</h1>
          <p style={{color:'#9CA3AF', fontSize:14}}>Last updated: April 2026</p>
        </div>

        <div style={{background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:'16px 20px', marginBottom:40}}>
          <p style={{fontSize:14, color:'#1E40AF', lineHeight:1.6, margin:0}}>
            <strong>Plain English Summary:</strong> We collect your name, email, and phone number to operate your membership. We collect payment information through Stripe, we never see or store your card details directly. We do not sell your data to anyone, ever.
          </p>
        </div>

        {[
          {
            n:'1', title:'Who We Are',
            body:`Regly ("we," "us," or "our") operates the membership platform at getregly.com. We are based in Chicago, Illinois. If you have any questions about this policy, contact us at getregly@gmail.com.`
          },
          {
            n:'2', title:'What Information We Collect',
            body:`We collect the following information when you use Regly:

From customers:
• Name, to identify your account and display it to businesses when looking up your membership
• Email address, to create and manage your account
• Phone number, to verify your membership at participating businesses at the point of sale
• Subscription and payment history, to manage your active memberships

From merchants:
• Business name, address, and description, to list your business on the platform
• Contact name and email, to manage your merchant account
• Stripe account details, to process payouts to your business

From all users:
• Login credentials (email and encrypted password)
• Usage data such as pages visited and actions taken on the platform (for debugging and improving the service)`
          },
          {
            n:'3', title:'How We Use Your Information',
            body:`We use the information we collect to:

• Create and manage your Regly account
• Process membership subscriptions and payments through Stripe
• Verify customer memberships at participating businesses via phone number lookup
• Display your business information to potential members (merchants only)
• Send account-related emails such as subscription confirmations and renewal notices
• Respond to support requests
• Improve and maintain the Regly platform

We do not use your information for advertising and we do not sell your data to any third party.`
          },
          {
            n:'4', title:'Payment Information',
            body:`All payments on Regly are processed by Stripe, a third-party payment processor. Regly never sees, stores, or has access to your full credit card number, CVV, or banking details.

When you subscribe to a membership, your payment information is transmitted directly to Stripe and stored securely on their servers under their own privacy and security policies. You can review Stripe\'s privacy policy at stripe.com/privacy.`
          },
          {
            n:'5', title:'How We Share Your Information',
            body:`We share your information only in the following limited circumstances:

• With the business you subscribe to: When you subscribe, the business can see your name and phone number in their member dashboard. This is necessary for them to verify and honor your membership perks.
• With Stripe: To process payments and issue payouts to merchants.
• With Supabase: Our database provider stores your account information securely. Supabase does not use your data for any purpose other than storage.
• If required by law: We may disclose your information if required to do so by a court order or applicable law.

We do not sell, rent, or trade your personal information to any third party for marketing or advertising purposes.`
          },
          {
            n:'6', title:'Data Retention',
            body:`We retain your account information for as long as your account is active. If you delete your account, we will remove your personal information from our active systems within 30 days, except where retention is required by law or for legitimate business purposes such as resolving disputes.

Subscription and payment records may be retained for up to 7 years for accounting and tax compliance purposes.`
          },
          {
            n:'7', title:'Your Rights',
            body:`You have the right to:

• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your account and associated data
• Opt out of non-essential communications

To exercise any of these rights, email us at getregly@gmail.com. We will respond within 30 days.`
          },
          {
            n:'8', title:'Cookies & Tracking',
            body:`Regly uses session cookies to keep you logged in to your account. We do not use advertising cookies, tracking pixels, or third-party analytics tools that collect personal data.

You can disable cookies in your browser settings, but doing so may prevent you from logging in to your Regly account.`
          },
          {
            n:'9', title:'Security',
            body:`We take reasonable measures to protect your personal information, including:

• Encrypted connections (HTTPS) across the entire platform
• Passwords stored using industry-standard hashing
• Access to personal data restricted to authorized systems only
• Payment data handled exclusively by Stripe under PCI-DSS compliance

No system is completely secure. If you believe your account has been compromised, contact us immediately at getregly@gmail.com.`
          },
          {
            n:'10', title:'Children\'s Privacy',
            body:`Regly is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us at getregly@gmail.com and we will remove the account promptly.`
          },
          {
            n:'11', title:'Changes to This Policy',
            body:`We may update this privacy policy from time to time. When we do, we will update the date at the top of this page and notify active users by email for any material changes. Your continued use of Regly after changes are posted constitutes your acceptance of the updated policy.`
          },
          {
            n:'12', title:'Contact',
            body:`If you have questions or concerns about this privacy policy or how we handle your data, contact us at:

Regly
getregly@gmail.com
getregly.com
Chicago, Illinois`
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
          <p style={{color:'#9CA3AF', fontSize:13}}>
            Questions? <span style={{color:'#C0442B'}}>getregly@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}
