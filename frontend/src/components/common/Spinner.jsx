const Spinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div
      role="status"
      aria-label="Loading"
      className="h-8 w-8 animate-spin rounded-full border-2 border-brand-50 border-t-brand"
    />
  </div>
);

export default Spinner;
