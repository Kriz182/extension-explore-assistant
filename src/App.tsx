import React, { useContext, useEffect } from 'react'
import { hot } from 'react-hot-loader/root'
import {
  Button,
  Page,
  SpaceVertical,
  FieldTextArea,
  Tabs2,
  Tab2,
} from '@looker/components'
import { ExtensionContext } from '@looker/extension-sdk-react'
import type { ChangeEvent } from 'react'
import { ExploreEmbed } from './ExploreEmbed'
import styles from './styles.module.css'
import { initDB, addData, getStoreData } from './db'

const BQ_GENAI_MODEL = process.env.BQ_GENAI_MODEL || ''
const BQ_GENAI_EXPLORE = process.env.BQ_GENAI_EXPLORE || ''

const AppInternal = () => {
  const { core40SDK } = useContext(ExtensionContext)
  const [exploreUrl, setExploreUrl] = React.useState<any>('')
  const [query, setQuery] = React.useState<string>('')
  const [explore, setExplore] = React.useState<any>(null)
  const [begin, setBegin] = React.useState<boolean>(false)
  const [submit, setSubmit] = React.useState<boolean>(false)
  const [db, setDb] = React.useState<boolean>(false)
  const [data, setData] = React.useState<any>([])
  const [exploreData, setExploreData] = React.useState<any>(null)

  const initialize = async () => {
    const status = await initDB()
    setDb(status)
    const responses = await getStoreData('chat')
    setData(responses)
  }

  useEffect(() => {
    if (begin) {
      initialize()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [begin])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
  }

  async function fetchData(prompt: string | undefined) {
  const question = prompt !== undefined ? prompt : query;
    console.log('Question: ', prompt, query);
    
      // Replace the fetch call with Looker SDK call
    const response = await core40SDK.ok(core40SDK.run_inline_query({
      result_format: 'json',
      body: {
        model: BQ_GENAI_MODEL,
        view: BQ_GENAI_EXPLORE,
        fields: [`${BQ_GENAI_EXPLORE}.generated_content`],
        filters: {[`${BQ_GENAI_EXPLORE}.prompt`]: question}
      }
    }));
    
      // Assuming response is in the format you specified
      // Extract the desired data
      const generateQueryContent = response[0][`${BQ_GENAI_EXPLORE}.generated_content`];
    
      // Log and set the extracted data
    console.log(generateQueryContent);
    setExploreUrl(generateQueryContent.trim() + '&toggle=dat,pik,vis');
  }
  

  const handleSubmit = async (prompt: string | undefined) => {
    const status = await initDB()
    setDb(status)
    const res = await addData('chat', { message: query })
    console.log(res)
    setData([...data, { message: prompt !== undefined ? prompt : query }])
    setSubmit(true)
    fetchData(prompt, exploreData)
  }

  const handleExampleSubmit = async (prompt: string) => {
    setQuery(prompt)
    handleSubmit(prompt)
    const elem = document.getElementById('historyScroll')
    if (elem) {
      elem.scrollTop = elem.scrollHeight
    }
  }

  const categorizedPrompts = [
    {
      category: 'Cohorting',
      prompt: 'Count of Users by first purchase date',
      color: 'blue',
    },
    {
      category: 'Audience Building',
      prompt:
        'Users who have purchased more than 100 dollars worth of Calvin Klein products and have purchased in the last 30 days',
      color: 'green',
    },
    {
      category: 'Period Comparison',
      prompt:
        'Total revenue by category this year compared to last year in a line chart with year pivoted',
      color: 'red',
    },
  ]

  return (
    <Page height="100%" className={styles.root}>
      {!begin && <LandingPage begin={setBegin} />}
      {begin && (
        <SpaceVertical>
          <div
            className={styles.scrollbar}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              className={styles.scrollbar}
              style={{
                width: '30vw',
                padding: '2rem',
                height: '100vh',
                borderRight: '1px solid #ccc',
                overflowY: 'scroll',
              }}
            >
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  fontFamily: 'sans-serif',
                  letterSpacing: '-0.1rem',
                  lineHeight: '2.5rem',
                  marginBottom: '1rem',
                  display: 'block',
                  textAlign: 'left',
                  width: 'auto',
                  height: 'auto',
                  border: 'none',
                }}
              >
                Explore Assistant Demo
              </span>
              <h3 style={{ color: 'rgb(26, 115, 232)' }}>
                Powered by Generative AI with Google
              </h3>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <FieldTextArea
                  label="Type your prompt in here"
                  description="Trained on an Ecommerce Dataset. Try asking for your data output in a viz!"
                  value={query}
                  onChange={handleChange}
                  width={'100%'}
                />
                <div
                  style={{
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: '50%' }}>
                    <Button
                      disabled={submit}
                      onClick={() => handleSubmit(undefined)}
                      style={{ width: '100%' }}
                    >
                      {submit ? <BardLogo search={true} /> : 'Run Prompt'}
                    </Button>
                  </div>
                </div>
                <Tabs2 distributed>
                  <Tab2 id="examples" label="Example Prompts">
                    <div
                      className={styles.scrollbar}
                      style={{ overflowY: 'scroll', height: '40vh' }}
                    >
                      {categorizedPrompts.map((item, index: number) => (
                        <div
                          key={index}
                          className={styles.card}
                          onClick={() => {
                            handleExampleSubmit(item.prompt)
                          }}
                        >
                          <span
                            style={{
                              color: `${item.color}`,
                              fontSize: '1.3vh',
                            }}
                          >
                            {item.category}
                          </span>
                          <span style={{ fontSize: '2vh' }} id="examplePrompt">
                            {item.prompt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Tab2>
                  <Tab2 id="history" label="History">
                    <div
                      className={styles.scrollbar}
                      id="historyScroll"
                      style={{ overflowY: 'scroll', height: '40vh' }}
                    >
                      {db &&
                        data.length > 0 &&
                        data
                          .filter((item: any) => item.message !== '')
                          .map((item: any, index: number) => {
                            return (
                              <div
                                key={index}
                                onClick={() =>
                                  handleExampleSubmit(item.message)
                                }
                                className={styles.card}
                              >
                                <span style={{ fontSize: '1.5vh' }}>
                                  {item.message}
                                </span>
                              </div>
                            )
                          })}
                    </div>
                  </Tab2>
                </Tabs2>
              </div>
            </div>
            <div
              style={{
                height: '100vh',
                width: '100%',
                backgroundColor: '#f7f7f7',
                zIndex: 1,
              }}
            >
              {!explore && <BardLogo />}
              {exploreUrl && (
                <div
                  style={{
                    backgroundColor: '#f7f7f7',
                    height: '100vh',
                    width: '100%',
                  }}
                >
                  {exploreUrl && (
                    <ExploreEmbed
                      exploreUrl={exploreUrl}
                      setExplore={setExplore}
                      setSubmit={setSubmit}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </SpaceVertical>
      )}
    </Page>
  )
}

const LandingPage = ({ begin }: { begin: boolean }) => {
  const docs = [
    {
      title: 'No Code Prompt Tuning',
      model: 'Vertex AI Generative AI Studio',
      description:
        'No code prompt tuning of foundational model with generated Python code for engineer hand off.',
      doc: 'https://cloud.google.com/vertex-ai/docs/generative-ai/learn/generative-ai-studio',
    },
    {
      title: 'Generate Text',
      model: 'text-bison-001',
      description:
        'Generative Text Model by Google. Used to Generate explore expanded url parameters. This is done based off 20 examples of question answer that is fed into the prompt context.',
      doc: 'https://developers.generativeai.google/tutorials/text_quickstart',
    },
  ]

  return (
    <SpaceVertical>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          alignContent: 'center',
          width: '100%',
          height: '100%',
          padding: '2rem',
          paddingTop: '10rem',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '40vw',
          }}
        >
          <span
            style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              letterSpacing: '-0.1rem',
              lineHeight: '4.5rem',
              marginBottom: '1rem',
              display: 'block',
              textAlign: 'left',
              width: '100%',
              border: 'none',
            }}
          >
            Explore Assistant Demo
          </span>
          <h3 style={{ color: 'rgb(26, 115, 232)' }}>
            Powered by Generative AI with Google
          </h3>
          <Button onClick={() => begin(true)}>Begin</Button>
          {docs.map((doc, index) => {
            return (
              <a
                href={doc.doc}
                style={{ textDecoration: 'none' }}
                target="_blank"
                rel="noreferrer"
                key={index}
              >
                <div
                  style={{
                    cursor: 'pointer',
                    width: '100%',
                    height: '18vh',
                    backgroundColor: 'white',
                    marginTop: '2rem',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <div
                    style={{
                      width: '20%',
                      height: 'auto',
                      borderRight: '1px solid #ccc',
                    }}
                  >
                    <img
                      height="70%"
                      width="70%"
                      src={
                        index === 0
                          ? 'https://lh3.googleusercontent.com/-1brN-k2sapOWO4gfdJKGEH8kZbfFjrzEMjNs1dl4u64PBH-yxVmB5vG2aHDatRudSByL3lwViUg1w'
                          : 'https://developers.generativeai.google/static/site-assets/images/marketing/home/icon-palm.webp'
                      }
                    />
                  </div>
                  <div
                    style={{
                      paddingTop: '1rem',
                      paddingLeft: '1rem',
                      width: '80%',
                      height: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        height: 'auto',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif',
                        letterSpacing: '-0.1rem',
                        display: 'block',
                        textAlign: 'left',
                        width: '100%',
                        color: 'black',
                        border: 'none',
                      }}
                    >
                      {doc.title}
                    </span>
                    <p
                      style={{ color: 'rgb(26, 115, 232)', fontSize: '0.8rem' }}
                    >
                      {doc.model}
                    </p>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        width: 'auto',
                        height: 'auto',
                        color: 'black',
                        opacity: 0.8,
                      }}
                    >
                      {doc.description}
                    </p>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </SpaceVertical>
  )
}

export interface BardLogoProps {
  search?: boolean | undefined
}

const BardLogo = ({ search }: BardLogoProps) => {
  const SVG = () => (
    <svg
      width="100%"
      height="100%"
      viewBox={search ? '-600 -300 9000 2500' : '0 -800 700 3000'}
      fill="none"
    >
      <path
        className={styles.bard}
        d="M515.09 725.824L472.006 824.503C455.444 862.434 402.954 862.434 386.393 824.503L343.308 725.824C304.966 638.006 235.953 568.104 149.868 529.892L31.2779 477.251C-6.42601 460.515 -6.42594 405.665 31.2779 388.929L146.164 337.932C234.463 298.737 304.714 226.244 342.401 135.431L386.044 30.2693C402.239 -8.75637 456.159 -8.75646 472.355 30.2692L515.998 135.432C553.685 226.244 623.935 298.737 712.234 337.932L827.121 388.929C864.825 405.665 864.825 460.515 827.121 477.251L708.53 529.892C622.446 568.104 553.433 638.006 515.09 725.824Z"
        fill="url(#paint0_radial_2525_777)"
      />
      <path
        d="M915.485 1036.98L903.367 1064.75C894.499 1085.08 866.349 1085.08 857.481 1064.75L845.364 1036.98C823.765 987.465 784.862 948.042 736.318 926.475L698.987 909.889C678.802 900.921 678.802 871.578 698.987 862.61L734.231 846.951C784.023 824.829 823.623 783.947 844.851 732.75L857.294 702.741C865.966 681.826 894.882 681.826 903.554 702.741L915.997 732.75C937.225 783.947 976.826 824.829 1026.62 846.951L1061.86 862.61C1082.05 871.578 1082.05 900.921 1061.86 909.889L1024.53 926.475C975.987 948.042 937.083 987.465 915.485 1036.98Z"
        fill="url(#paint1_radial_2525_777)"
      />
      <defs>
        <radialGradient
          id="paint0_radial_2525_777"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(670.447 474.006) rotate(78.858) scale(665.5 665.824)"
        >
          <stop stopColor="#1BA1E3" />
          <stop offset="0.0001" stopColor="#1BA1E3" />
          <stop offset="0.300221" stopColor="#5489D6" />
          <stop offset="0.545524" stopColor="#9B72CB" />
          <stop offset="0.825372" stopColor="#D96570" />
          <stop offset="1" stopColor="#F49C46" />
          <animate
            attributeName="r"
            dur="5000ms"
            from="0"
            to="1"
            repeatCount="indefinite"
          />
        </radialGradient>
        <radialGradient
          id="paint1_radial_2525_777"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(670.447 474.006) rotate(78.858) scale(665.5 665.824)"
        >
          <stop stopColor="#1BA1E3" />
          <stop offset="0.0001" stopColor="#1BA1E3" />
          <stop offset="0.300221" stopColor="#5489D6" />
          <stop offset="0.545524" stopColor="#9B72CB" />
          <stop offset="0.825372" stopColor="#D96570" />
          <stop offset="1" stopColor="#F49C46" />
          <animate
            attributeName="r"
            dur="5000ms"
            from="0"
            to="1"
            repeatCount="indefinite"
          />
        </radialGradient>
      </defs>
    </svg>
  )
  return (
    <>
      {search ? (
        <div
          style={{
            zIndex: 1,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <h3 style={{ color: 'rgb(26, 115, 232)' }}>Matching</h3>
          {SVG()}
        </div>
      ) : (
        <>{SVG()}</>
      )}
    </>
  )
}

export const App = hot(AppInternal)
