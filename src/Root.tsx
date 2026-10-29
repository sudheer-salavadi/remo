import "./index.css";
import { Composition, Folder } from "remotion";
import { AppPromo, APP_PROMO_SECONDS } from "./templates/AppPromo/AppPromo";
import { EndCardScene } from "./templates/AppPromo/EndCardScene";
import { HookScene } from "./templates/AppPromo/HookScene";
import { appPromoSchema } from "./templates/AppPromo/schema";
import { ShowcaseScene } from "./templates/AppPromo/ShowcaseScene";

/**
 * Each app registers its compositions in src/apps/<app>/<app>.compositions.tsx (default export).
 * Everything in src/apps/ except demo/ is gitignored, so client work stays on your machine.
 */
const apps = require.context("./apps", true, /\.compositions\.tsx$/);
const appKeys = apps.keys().filter((k) => k.startsWith("./"));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {appKeys.map((k) => {
        const App = (apps(k) as { default: React.FC }).default;
        return <App key={k} />;
      })}

      {/* One folder per app. Copy the example block, change the id + defaultProps. */}
      <Folder name="Example-App">
        <Composition
          id="ExampleApp-Promo-16x9"
          component={AppPromo}
          schema={appPromoSchema}
          durationInFrames={Math.round(APP_PROMO_SECONDS * 60)}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{
            appName: "Lumen",
            headline: "Your day, beautifully organized.",
            base: "#07070b",
            accent: "#7c5cff",
            accent2: "#22d3ee",
            features: [
              { title: "Smart inbox", body: "Everything that matters, surfaced first." },
              { title: "Focus mode", body: "One tap silences the noise." },
              { title: "Syncs everywhere", body: "Phone, tablet, desktop. Instantly." },
            ],
            cta: "Download on the App Store",
          }}
        />
        <Composition
          id="ExampleApp-Promo-9x16"
          component={AppPromo}
          schema={appPromoSchema}
          durationInFrames={Math.round(APP_PROMO_SECONDS * 60)}
          fps={60}
          width={1080}
          height={1920}
          defaultProps={{
            appName: "Lumen",
            headline: "Your day, beautifully organized.",
            base: "#07070b",
            accent: "#7c5cff",
            accent2: "#22d3ee",
            features: [
              { title: "Smart inbox", body: "Everything that matters, surfaced first." },
              { title: "Focus mode", body: "One tap silences the noise." },
              { title: "Syncs everywhere", body: "Phone, tablet, desktop. Instantly." },
            ],
            cta: "Download on the App Store",
          }}
        />
      </Folder>

      {/* Connected compositions: double-click a scene in the promo timeline to edit it standalone. */}
      <Folder name="AppPromo-Scenes">
        <Composition
          id="HookScene"
          component={HookScene}
          durationInFrames={150}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{
            appName: "Lumen",
            headline: "Your day, beautifully organized.",
            accent: "#7c5cff",
            style: { backgroundColor: "#07070b" },
          }}
        />
        <Composition
          id="ShowcaseScene"
          component={ShowcaseScene}
          durationInFrames={300}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{
            appName: "Lumen",
            base: "#07070b",
            accent: "#7c5cff",
            accent2: "#22d3ee",
            features: [
              { title: "Smart inbox", body: "Everything that matters, surfaced first." },
              { title: "Focus mode", body: "One tap silences the noise." },
              { title: "Syncs everywhere", body: "Phone, tablet, desktop. Instantly." },
            ],
            style: { backgroundColor: "#07070b" },
          }}
        />
        <Composition
          id="EndCardScene"
          component={EndCardScene}
          durationInFrames={180}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{
            appName: "Lumen",
            cta: "Download on the App Store",
            accent: "#7c5cff",
            accent2: "#22d3ee",
            style: { backgroundColor: "#07070b" },
          }}
        />
      </Folder>
    </>
  );
};
