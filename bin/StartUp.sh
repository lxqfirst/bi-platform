#! /bin/sh

echo "being start demo project, please wait a moment ... ..."
if [ ! -n "$JAVA_HOME" ]; then
	echo "please make sure you have already install java 8 and set JAVA_HOME in your profile"
	exit 1
fi

if [ ! -x "$JAVA_HOME/bin/java" ]; then
	echo "please make sure you can invoke the command $JAVA_HOME/bin/java"
	exit 1
fi
parentPath=$(dirname $(pwd))

export CLASSPATH = $CLASSPATH:$parentPath/fileserver/target/fileserver-0.0.1-SNAPSHOT.jar
echo $CLASSPATH
echo " begin start file server ... ...."
$JAVA_HOME/bin/java 
echo "Congratulation! you can using BI-Platform  with URL :[http://localhost:8090/silkroad/home.html ] and user [demo/demo] through Chrome Browser "