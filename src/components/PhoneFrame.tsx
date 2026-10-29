type PhoneFrameProps = {
  readonly height: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
};

/** Minimal modern phone bezel. Put an <Img>/<Video> of the app screen (or JSX UI) inside. */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({ height, children, style }) => {
  const width = height * 0.4615; // 19.5:9
  const bezel = height * 0.018;
  const radius = height * 0.085;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        padding: bezel,
        background: "linear-gradient(145deg, #3a3a3e, #0d0d0f 45%, #2a2a2e)",
        boxShadow: `0 ${height * 0.06}px ${height * 0.12}px rgba(0,0,0,0.55), inset 0 0 0 1.5px rgba(255,255,255,0.12)`,
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            top: height * 0.014,
            left: "50%",
            translate: "-50% 0",
            width: width * 0.3,
            height: height * 0.032,
            borderRadius: 999,
            backgroundColor: "#000",
          }}
        />
      </div>
    </div>
  );
};
