export default function StatCard({ label, value }) {
  return (
    <div className="bg-brand-dark-card border border-white/10 rounded-xl p-6">
      <p className="text-sm text-white/50 uppercase tracking-wide">{label}</p>
      <p className="text-4xl font-black text-white mt-2">{value}</p>
    </div>
  );
}
