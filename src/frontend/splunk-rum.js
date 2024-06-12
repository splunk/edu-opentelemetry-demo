import React, { useEffect } from 'react';
import SplunkRum from '@splunk/otel-web';

export async function getStaticProps() {
  // Logs will be printed to the terminal
  console.log('in splunk-rum.js, getStaticProps(), NEXT_PUBLIC_SPLUNK_REALM=', process.env.NEXT_PUBLIC_SPLUNK_REALM);

  return {
    props: {
      rumRealm: process.env.NEXT_PUBLIC_SPLUNK_REALM,
      rumToken: process.env.NEXT_PUBLIC_SPLUNK_RUM_TOKEN,
      rumAppName: process.env.NEXT_PUBLIC_SPLUNK_RUM_APP_NAME,
      rumEnv: process.env.NEXT_PUBLIC_SPLUNK_RUM_ENV,
    },
  };
}

const HomePage = ({ rumRealm, rumToken, rumAppName, rumEnv }) => {
  useEffect(() => {
   console.log('HomePage component mounted');
    SplunkRum.init({
      realm: rumRealm,
      rumAccessToken: rumToken,
      applicationName: rumAppName,
      deploymentEnvironment: rumEnv,
    });
  }, [rumRealm, rumToken, rumAppName, rumEnv]);

  return (
    <div>
	  <h1> Splunk RUM Enabled</h1>
    </div>
  );
};

export default HomePage;

//SplunkRum.init({
//    realm: rumRealm,
//    rumAccessToken: rumToken,
//    applicationName: rumAppName,
//    deploymentEnvironment: rumEnv,
//  });

