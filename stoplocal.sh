#!/usr/bin/env bash

pid=$(ps aux | grep "python -m http.server" | grep -v grep | awk '{print $2}')
if [[ $pid ]]; then
	kill $pid
fi
	
