import Hero from "@/components/Hero";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
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