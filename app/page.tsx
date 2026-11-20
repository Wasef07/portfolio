import Nav from "@/components/Nav";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <header
          id="top"
          className="grid min-h-screen place-items-center bg-c1 px-6 text-center"
        >
          <div>
            <h1 className="font-display text-6xl">Sk Wasef Mostafa</h1>
            <p className="mt-4 text-ink2">Software developer</p>
          </div>
        </header>
        <section id="about" className="grid min-h-screen place-items-center bg-c2">
          <h2 className="font-display text-4xl">About</h2>
        </section>
        <section id="projects" className="grid min-h-screen place-items-center bg-c3">
          <h2 className="font-display text-4xl">Projects</h2>
        </section>
        <section id="skills" className="grid min-h-screen place-items-center bg-c2">
          <h2 className="font-display text-4xl">Skills</h2>
        </section>
      </main>
      <footer id="contact" className="grid min-h-screen place-items-center bg-c4">
        <h2 className="font-display text-4xl">Contact</h2>
      </footer>
    </>
  );
}