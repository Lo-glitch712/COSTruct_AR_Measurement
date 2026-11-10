export default function BlockStack() {
  return (
    <div className="block-stack" aria-hidden="true">
      <div className="block-row">
        <span className="block-brick" />
        <span className="block-brick" />
        <span className="block-brick" />
      </div>
      <div className="block-row block-row-offset">
        <span className="block-brick" />
        <span className="block-brick" />
        <span className="block-brick" />
      </div>
      <div className="block-row block-row-top">
        <span className="block-brick" />
        <span className="block-brick" />
      </div>
    </div>
  )
}
