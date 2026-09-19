import Link from "next/link";
import { ButtonLink, Eyebrow, PageIntro } from "@/components/ui";
import { TeamProfile } from "@/components/team-profile";
import { ClientExperiences } from "@/components/client-experiences";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Career Strategy & Positioning",
  "RSG Career Strategy helps professionals strengthen their positioning, improve their resume and LinkedIn presence, target the right opportunities, and prepare for interviews with a more intentional job-search strategy.",
  "/careers/",
);
const services = [
  {
    name: "Career Positioning",
    line: "Make your experience make sense for what comes next.",
    areas: [
      "Resume strategy",
      "Experience translation",
      "Target-role alignment",
      "Professional narrative",
      "Career-change positioning",
    ],
  },
  {
    name: "LinkedIn Optimization",
    line: "Bring your public profile into alignment with your goals.",
    areas: [
      "Headline and summary positioning",
      "Role descriptions",
      "Keyword strategy",
      "Alignment with target roles",
      "Consistency with resume positioning",
    ],
  },
  {
    name: "Interview Preparation",
    line: "Prepare to explain your experience with clarity.",
    areas: [
      "Interview strategy",
      "STAR story development",
      "Difficult-question preparation",
      "Career-change explanations",
      "Message discipline",
      "Mock interview preparation",
    ],
  },
  {
    name: "Career Search Strategy",
    line: "Choose a more intentional path to the right opportunities.",
    areas: [
      "Role targeting",
      "Job-search direction",
      "Industry-transition strategy",
      "Application strategy",
      "Networking positioning",
      "Career advancement planning",
    ],
  },
];
export default function Careers() {
  return (
    <>
      <PageIntro
        eyebrow="RSG Career Strategy"
        title="Your Career Is Not a Resume. It’s a Story."
      >
        <p className="career-descriptor">
          Career Positioning · Resume Strategy · Interview Preparation
        </p>
        <p>
          Most people undersell themselves not because they lack experience, but
          because they have not learned how to position that experience for
          where they want to go next.
        </p>
        <div className="hero-actions">
          <ButtonLink href="/careers/diagnostic/">
            Start Your Career Diagnostic
          </ButtonLink>
          <a className="text-link" href="#career-services">
            Explore Career Services <span aria-hidden="true">↓</span>
          </a>
        </div>
      </PageIntro>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <Eyebrow>A practical perspective</Eyebrow>
            <div>
              <h2>Experience, translated into opportunity.</h2>
              <p>
                Sometimes the experience is already there. The challenge is
                making employers understand its value.
              </p>
            </div>
          </div>
          <div className="capability-grid">
            {[
              [
                "Hiring-side insight",
                "RSG understands how candidates are screened, evaluated, and compared.",
              ],
              [
                "Proven in practice",
                "Career materials are built around practical positioning designed to help candidates communicate their experience more effectively and pursue relevant opportunities.",
              ],
              [
                "ATS from the inside",
                "RSG understands the role ATS systems, keywords, screening criteria, and recruiter workflows can play in the modern job search.",
              ],
              [
                "Cross-industry strategy",
                "Experience across consulting, corporate development, finance, healthcare, and business services informs how transferable experience is positioned.",
              ],
            ].map(([title, copy], i) => (
              <div className="capability-card" key={title}>
                <div className="card-top">0{i + 1}</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="audience-section">
        <div className="container split-layout">
          <div>
            <Eyebrow>Where you are today</Eyebrow>
            <h2>Does any of this sound familiar?</h2>
            <p>
              A clearer picture of the challenge helps us determine the right
              support.
            </p>
          </div>
          <ul className="question-list">
            {[
              "I keep applying but rarely hear back.",
              "I know I have strong experience, but my resume does not show it.",
              "I am not sure what roles I should actually be targeting.",
              "I want to change industries but do not know how to position my background.",
              "I am trying to move into a higher-paying or more senior role.",
              "My work history is complicated and I do not know how to present it.",
              "I have an employment gap or time away from work.",
              "I get interviews but struggle to close.",
              "I am returning to the workforce.",
              "I have experience but lack the formal title or credential employers seem to want.",
            ].map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Eyebrow>How it works</Eyebrow>
          <h2>Listen. Understand. Align. Deliver.</h2>
          <div className="capability-grid">
            {[
              [
                "Listen",
                "Start with a real conversation about your experience, goals, work history, and what you want next.",
              ],
              [
                "Understand",
                "Identify what may be helping or hurting your positioning, including target roles, experience gaps, search strategy, and how your background may be interpreted.",
              ],
              [
                "Align",
                "Translate your experience into the language, priorities, and expectations of the roles you are pursuing.",
              ],
              [
                "Deliver",
                "Build the right combination of resume, LinkedIn, interview preparation, and search strategy around your goals.",
              ],
            ].map(([title, copy], i) => (
              <div className="capability-card" key={title}>
                <div className="card-top">0{i + 1}</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        className="container"
        id="career-services"
        aria-label="Career services"
      >
        {services.map((s, i) => (
          <article className="capability-detail" key={s.name}>
            <div>
              <Eyebrow>Career services · 0{i + 1}</Eyebrow>
              <h2>{s.name}</h2>
              <p>{s.line}</p>
            </div>
            <ul className="ruled-list">
              {s.areas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </article>
        ))}
        <p className="industry-scope">
          RSG provides career strategy and positioning support. It is not a
          staffing, recruiting, or placement agency. Interviews, employment, and
          compensation outcomes are not guaranteed.
        </p>
      </section>
      <section className="section">
        <div className="container split-layout">
          <div>
            <Eyebrow>Who this is for</Eyebrow>
            <h2>A next step that fits your experience.</h2>
          </div>
          <ul className="ruled-list">
            {[
              "Professionals changing industries",
              "Candidates applying consistently without getting traction",
              "Professionals pursuing a stretch role",
              "People moving into management or leadership",
              "Candidates returning after time away from work",
              "Professionals with strong experience but unclear positioning",
              "Candidates unsure which roles fit their background",
              "Professionals who need help communicating transferable skills",
            ].map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="audience-section">
        <div className="container">
          <Eyebrow>The person behind the advice</Eyebrow>
          <h2>Business perspective. Personal direction.</h2>
          <TeamProfile
            name="Dominick Reed"
            role="Founder, RSG"
            portrait={{
              src: "/images/dominick-reed.jpg",
              width: 480,
              height: 720,
            }}
          >
            <p>
              Dominick’s background spans management consulting, transaction
              advisory, corporate development, strategic finance, financial
              analysis, and business transformation. His professional experience
              includes Accenture and Stout, alongside corporate development and
              strategic finance within a multi-site healthcare services
              organization.
            </p>
            <p>
              That cross-industry perspective informs how he helps professionals
              translate their experience, develop a coherent narrative, and
              position themselves for the roles they want to pursue.
            </p>
            <p className="profile-note">
              RSG is independent. Current and former employers do not sponsor,
              endorse, partner with, or have an affiliation with RSG.
            </p>
          </TeamProfile>
        </div>
      </section>
      <ClientExperiences practice="career" />
      <section className="section">
        <div className="container split-layout">
          <div>
            <Eyebrow>One RSG. Two practices.</Eyebrow>
            <h2>Strategy for businesses. Strategy for careers.</h2>
          </div>
          <div className="prose">
            <p>
              RSG helps businesses and professionals get clear on where they
              are, where they want to go, and what needs to happen next. Career
              Strategy focuses on you as a professional; Business Advisory
              focuses on the business you’re building.
            </p>
            <Link className="text-link" href="/what-we-do/">
              Explore RSG Business Advisory →
            </Link>
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <Eyebrow>A clearer path to what’s next.</Eyebrow>
            <h2>Start with your story.</h2>
            <p>
              Share your experience, goals, and what’s getting in the way. We’ll
              review your diagnostic and follow up regarding potential next
              steps.
            </p>
            <p>Approximately 5–7 minutes. No obligation.</p>
          </div>
          <ButtonLink href="/careers/diagnostic/">
            Start Your Career Diagnostic
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

