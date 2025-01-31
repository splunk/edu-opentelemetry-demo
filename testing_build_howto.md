## Overview

The K8s datagen relies on three primary repos in order to build and deploy properly on SLAB
- [Source Datagen Code](https://github.com/splunk/edu-opentelemetry-demo)
- [Helm Charts Repo](https://github.com/splunk/edu-datagen-helm-charts/tree/main)
- [Deploy Scripts](https://github.com/splunk/edu-datagen-apps)

When a SLAB instance of the k8s datgen is spun up it pulls the latest package from the ghcr package registry associated with the [source repo](https://github.com/splunk/edu-opentelemetry-demo), the latest helm charts from the [helm chart repo](https://github.com/splunk/edu-datagen-helm-charts/tree/main), and the latest deploy scripts from the [deploy script repo](https://github.com/splunk/edu-datagen-app).

You might need to ask Alex to give you permissions for each of these repos. 

## Testing

In order to test changes on SLAB without impacting the current resources that classes depend on you will need to follow these steps

# Create a Testing Package
- Create a new testing branch on the source repo and test your changes to service locally via docker
- Build and push a testing ghcr package with a testing tag to the github repo
 TODO: Double check these steps with Alex P.
    - Be in your git branch and repo on the command line
    - I you have to make an access token on Github and then think Alex might have to give permissions on the repo to login
    - Once that is done you can login to the registry 
    - ```docker login ghcr.io -u username --password-stdin```
    Then you will build your changes
    - ```docker build -t your_dockerhub_username/image_name:tag .```
    - The tag should be something like "testing" so it doesn't overwrite the one currently being used by courses
    - ```docker push your_dockerhub_username/image_name:tag```

# Update the helm charts

This jess_scenario_dev branch has pulled the latest upstream changes from the base repo which includes a new service that makes a UI for the feature flags. The current helm charts don't have that service included so you will need to fork the helm chart repo and then make edits to include any new services. (Forking because we don't want to mess up any running courses that rely on the unedited helm charts)

I'm not completely clear on what edits to make beyond forking the repo.

# Running the testing updates on SLAB
- Deploy a K8s datagen on SLAB like you normally would
- Before running the deploy scripts make these changes to deploy_datagen.sh using nano
- Changethe 
- Change the helm chart variables to your testing links and images
- ```SPLUNK_DATAGEN_HELM_PACKAGE_NAME=splunk-datagen```
```SPLUNK_DATAGEN_HELM_REPO_NAME=edu-datagen-helm-charts```
```SPLUNK_DATAGEN_HELM_CHART_NAME=splunk-k8s-o11y-datagen```
```SPLUNK_DATAGEN_HELM_CHART_URL=https://splunk.github.io/edu-datagen-helm-charts```

- Change the demo app image tag and repo link to the testing one you pushed
- ```DEMO_APP_IMAGE_TAG=1.11.0```
```DEMO_APP_IMAGE_REPO=ghcr.io/splunk/edu-astroshop```

Save and then run the deploy script to test your changes







