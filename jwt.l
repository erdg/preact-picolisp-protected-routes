### Usage - static values
#
#    (encodeJWT "secret" 3600 
#       ("iss" . "mywebsite.com") 
#       ("sub" . "user1234") )
# 
# The above call would issue a JWT signed with the key "secret" that expires
# 3600 seconds (1 hour) from now. The payload would be:
#
# {
#    "iss": "mywebsite.com"
#    "sub": "user1234"
#    "exp": unix time + offset
# }
#
### Usage - dynamic values (see NOTE below)
#
# If the CDR of a claim is a list, it will be evaluated. 
#
#    (with (db 'id '+User 1234)
#       (encodeJWT "secret" 3600 
#          ("iss" . "mywebsite.com") 
#          ("sub" . (pack "user" (: id))) ) )
#
# This would yield the same payload as above.
#
### Arguments
#
# Key - secret key to encode jwt
# Exp - expiration, offset in seconds from unix time stamp at creation
# Lst - dotted pairs of claims to be included in payload
#
# TODO - tests!
#
(de encodeJWT (Key Exp . Lst)
   (use Token
      # returns "b' @Token '"
      (setq Token
         (in
            (make
               (link 'jwt3)
               (link (pack "--key=" Key))
               (link (pack "exp=+" Exp))
               (for L Lst
                  (link 
                     (pack 
                        (car L) 
                        "=" 
                        # NOTE - this allows to include dynamic data
                        # by passing a list in the CDR of a pair.
                        (if (atom (cdr L))
                           (cdr L)
                           (eval (cdr L)) ) ) ) ) )
            (line T) ) )
      # clean up Token, strip leading "b'" and trailing "'"
      (pack (tail -2 (head -1 (chop Token)))) ) )

# Usage - (decodeJWT "secret" "json.web.token")
# 
# Returns - an 'assoc' list of claims in the payload on success, NIL on failure.
(de decodeJWT (Key Token)
   (json~decode
      (pre? "{"   # make sure jwt3 returned json and not an error
         (in (list 'jwt3 (pack "--key=" Key) (pack Token)) (line T)) ) ) )
