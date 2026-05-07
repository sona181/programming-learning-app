export function calculateMonthlyEarnings(payments: any[]) {
  const now = new Date();

  return payments
    .filter((p) => {
      const d = new Date(p.createdAt);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
}