#!/bin/bash

"${mongo[@]}" colleges <<-EOJS
	    db.createUser({
        user: "${DB_USER}",
   	    pwd: "${DB_PASSWORD}",
    	roles: [{ db: "colleges", role: "readWrite" }]	
	});
EOJS

"${mongo[@]}" colleges <<-EOJS
	    db.users.insert({
        user: "${DB_USER}",
   	    pwd: "${DB_PASSWORD}",	
	});
EOJS