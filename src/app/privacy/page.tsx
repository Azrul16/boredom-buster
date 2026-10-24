export const metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy/" },
};
export default function Privacy() {
  return (
    <article className="wrap prose">
      <span className="eyebrow purple">KEEP IT SIMPLE</span>
      <h1>Your play. Your device.</h1>
      <p>
        Boredom Buster does not ask you to register, enter an email address, or
        share personal information.
      </p>
      <h2>Local browser storage</h2>
      <p>
        We save game scores, theme and audio preferences, XP, achievements, and
        challenge progress in localStorage on this device. These records are not
        sent to an application server. You can remove them by clearing this
        website’s browser data.
      </p>
      <h2>Hosting</h2>
      <p>
        Your hosting provider may process routine connection information such as
        IP address and request time when serving the website. This application
        includes no advertising, tracking pixels, or analytics services.
      </p>
      <h2>No cloud synchronization</h2>
      <p>
        Progress does not transfer between browsers or devices. The games still
        work when local storage is unavailable, but progress may not be
        retained.
      </p>
    </article>
  );
}
