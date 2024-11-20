import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { handle } from 'frog/next';
import { serveStatic } from 'frog/serve-static';
import { gql, GraphQLClient } from "graphql-request";

// GraphQL client setup
const graphQLClient = new GraphQLClient(
  "https://api.studio.thegraph.com/query/23537/moxie_protocol_stats_mainnet/version/latest"
);

const query = gql`
query MyQuery($fanTokenAddress: ID) {
  subjectTokens(where: { id: $fanTokenAddress }) {
    currentPriceInMoxie
  }
}
`;

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Frog Frame',
});

app.frame('/', async (c) => {
  const { buttonValue, inputText } = c;
  let price = 0;

  if (buttonValue === "check" && inputText) {
    const userInput = inputText; // Capture user input

    try {
      // Fetch price from GraphQL API
      const data = await graphQLClient.request(query, {
        fanTokenAddress: userInput,
      });

      // Check if data.subjectTokens contains any result
      if (data.subjectTokens && data.subjectTokens.length > 0) {
        price = data.subjectTokens[0].currentPriceInMoxie;
      } else {
        price = null;  // No data found for the token
      }
    } catch (e) {
      console.log(e);  // Log the error for debugging
      price = null;    // Fallback when error occurs
    }
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432999, #13201F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div style={{
          fontSize: '32px',
          color: 'grey',
          marginBottom: '30px'
        }}>
          Fan Token Price Checker By Themeht
        </div>
        {price !== null ? (
          <p style={{ color: 'white', fontSize: '48px' }}>
            <span style={{color:'yellow', marginRight: '15px'}}>Fan</span> <span style={{color:'yellow', marginRight: '15px'}}>Token</span> Price: <span style={{color: 'green', marginLeft: '20px'}}>{Math.round(price)} M</span>
          </p>
        ) : (
          <p style={{ color: 'white', fontSize: '48px' }}>
            Price not available
          </p>
        )}
                <div style={{
          fontSize: '32px',
          color: 'grey',
          marginTop: '30px'
        }}>
          Please Follow Me For More Frames
        </div>
      </div>

    ),
    intents: [
      <TextInput placeholder="Enter Fan Token Address" />,
      <Button value="check">Check Price</Button>,
      <Button.Link href="https://warpcast.com/themeht">Follow Me</Button.Link>,
    ],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined';
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
