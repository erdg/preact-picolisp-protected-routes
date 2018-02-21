(load "http.l" "json.l" "jwt.l")

(class +User +Entity)
   (rel nm (+Key +String))
   ### plain text password for simplicity
   (rel pw (+String))

(de getJson (Key Lst)
   (cdr (assoc Key Lst)) )

(de respondJson (Lst)
   (let Json (json~encode Lst)
      (http1 "application/json" 0)
      (prinl "Access-Control-Allow-Origin: *^M")
      (prinl "Content-Length: " (size Json) "^M^J^M")
      (prin Json) ) )

(de respondJsonError (Str)
   (respondJson
      (list
         (cons "error"
            Str ) ) ) )
            

(de loginUser ()
   (out 2 (prinl "login request"))
   (let [Json (json~decode *Post)  Nm (getJson "name" Json)  Pw (getJson "password" Json)]
      (ifn (db 'nm '+User Nm)
         (respondJsonError (pack "'" Nm "' not found in DB, please try again or signup."))
         (let Token (encodeJWT "secret" 3600 ("iss" . "test") ("sub" . (pack Nm)))
            (respondJson (list (cons "token" Token))) ) ) ) )

(de newUser ()
   (out 2 (prinl "signup request"))
   (let [Json (json~decode *Post)  
         Nm   (getJson "name" Json)  
         Pw   (getJson "password" Json) ]
      (new! '(+User) 'nm Nm 'pw Pw)
      (respondJson (list (cons "token" (encodeJWT "secret" 3600 ("iss" . "test") ("sub" . (pack Nm)))))) ) )

(de checkToken ()
   (let [Json  (json~decode *Post)
         Token (getJson "token" Json) ]
      (ifn (decodeJWT "secret" Token)
         (prog 
            (prinl "HTTP/1.0 403 Forbidden^M") 
            (prinl "Access-Control-Allow-Origin: *^M")
            (prinl "^M") )
         (prog
            (prinl "HTTP/1.0 204 No Content^M") 
            (prinl "Access-Control-Allow-Origin: *^M")
            (prinl "^M") ) ) ) )

(de accessProfile (Nm)
   (let [Json  (json~decode *Post)
         Token (decodeJWT "secret" (getJson "token" Json)) ]
      (ifn (= Nm (lowc (getJson "sub" Token)))
        (prog 
            (prinl "HTTP/1.0 403 Forbidden^M") 
            (prinl "Access-Control-Allow-Origin: *^M")
            (prinl "^M") )
         (prog
            (prinl "HTTP/1.0 204 No Content^M") 
            (prinl "Access-Control-Allow-Origin: *^M")
            (prinl "^M") ) ) ) )
        
(de main () (pool "app.db"))

(de go () (server 4040)) 
