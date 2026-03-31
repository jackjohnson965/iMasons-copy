export default function StatCard({ label, value }) {
  return (
    <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-6">
      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-3xl font-black text-white mt-2">{value}</p>
    </div>
  );
}
