export default function Loading() {
  return (
    <div className="loading-page" style={{ minHeight: "50vh", justifyContent: "center" }}>
      <div className="spinner" />
      <span style={{ marginLeft: "0.5rem" }}>Loading...</span>
    </div>
  );
}
