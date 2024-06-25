import SplunkRum from '@splunk/otel-web';

SplunkRum.init({
    realm: "SPLUNK_RUM_REALM_PLACEHOLDER",
    rumAccessToken: "SPLUNK_RUM_TOKEN_PLACEHOLDER",
    applicationName: "SPLUNK_RUM_APP_PLACEHOLDER",
    deploymentEnvironment: "SPLUNK_RUM_ENV_PLACEHOLDER"
});

//SplunkRum.init({
//    realm: "us1",
//    rumAccessToken: "Qad35m7E6ld6p_-O_RxwEg",
//    applicationName: "astroshop_lab_2",
//    deploymentEnvironment: "astroshop_lab_2"
//});
