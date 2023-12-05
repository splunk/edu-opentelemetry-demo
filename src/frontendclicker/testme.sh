SHOP_URL=http://a6e42a89444634901b663f9b8412c1c2-1020822336.us-west-2.elb.amazonaws.com:8080
DELAY=5
BROWSER=chrome

docker run -d -e SHOP_URL=$SHOP_URL -e DELAY=$DELAY -e BROWSER=$BROWSER frontendclicker 
