
"use client";

import { useEffect, useState } from "react";

const firstNames = [
  "Brian", "Aisha", "Kevin", "Wanjiru", "David",
  "Mary", "Hassan", "Faith", "Joseph", "Sheila",
  "Peter", "Grace", "Daniel", "Zawadi", "Esther",
  "Samuel", "Naomi", "Abdul", "Mercy", "Ian",
  "Purity", "Collins", "Njeri", "Omar", "Brenda"
];

const lastNames = [
  "Mwangi", "Hassan", "Otieno", "Kamau", "Kiptoo",
  "Atieno", "Abdalla", "Muthoni", "Musyoka", "Wekesa",
  "Maina", "Chebet", "Barasa", "Juma", "Naliaka",
  "Omondi", "Wanjala", "Kimani", "Mutua", "Kariuki",
  "Adhiambo", "Muli", "Kiplagat", "Farah", "Njoroge"
];

function createEntry() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const digits = Math.floor(100 + Math.random() * 900);

  return {
    id: `${Date.now()}-${Math.random()}`,
    name: `${first} ${last}`,
    phone: `+254 7** *** ${digits}`,
    amount: Math.floor(600 + Math.random() * 601)
  };
}

export default function SampleWithdrawalActivity() {
  const [entry, setEntry] = useState<ReturnType<typeof createEntry> | null>(null);

  useEffect(() => {
    setEntry(createEntry());

    const timer = window.setInterval(() => {
      setEntry(createEntry());
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="sample-withdrawal">
      <div className="sample-withdrawal-heading">
        <strong>Recent Withdrawal Activity</strong>
        <span>SAMPLE ACTIVITY</span>
      </div>

      <div className="sample-withdrawal-window">
        {entry && (
          <div className="sample-withdrawal-entry" key={entry.id}>
            <div className="sample-withdrawal-avatar">
              {entry.name.split(" ").map(part => part[0]).join("")}
            </div>

            <div className="sample-withdrawal-person">
              <strong>{entry.name}</strong>
              <small>{entry.phone}</small>
            </div>

            <strong className="sample-withdrawal-amount">
              KES {entry.amount.toLocaleString("en-KE")}
            </strong>
          </div>
        )}
      </div>

      <style jsx>{`
        .sample-withdrawal {
          margin: 16px 0;
          padding: 16px 0 12px;
          background: linear-gradient(135deg, #fff, #f4eaff);
          border: 1px solid #e6d5ff;
          border-radius: 18px;
          overflow: hidden;
        }

        .sample-withdrawal-heading {
          padding: 0 15px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #32105d;
          font-size: 14px;
        }

        .sample-withdrawal-heading span {
          background: #eee2ff;
          color: #6d28d9;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
        }

        .sample-withdrawal-window {
          overflow: hidden;
          min-height: 58px;
        }

        .sample-withdrawal-entry {
          display: flex;
          align-items: center;
          gap: 10px;
          width: max-content;
          padding: 10px 14px;
          background: white;
          border: 1px solid #eadfff;
          border-radius: 12px;
          animation: sampleRoll 6s linear both;
        }

        .sample-withdrawal-avatar {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(145deg, #8b35e8, #4c0b91);
          color: white;
          font-size: 12px;
          font-weight: 900;
        }

        .sample-withdrawal-person {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .sample-withdrawal-person strong {
          color: #291044;
          font-size: 12px;
        }

        .sample-withdrawal-person small {
          color: #87769a;
          font-size: 10px;
        }

        .sample-withdrawal-amount {
          color: #5b21b6;
          font-size: 12px;
          white-space: nowrap;
        }

        @keyframes sampleRoll {
          from { transform: translateX(100vw); }
          to { transform: translateX(-110%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sample-withdrawal-entry {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
