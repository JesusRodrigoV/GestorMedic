import secrets
import string

alphabet = string.ascii_letters + string.digits + string.punctuation
new_secret = ''.join(secrets.choice(alphabet) for i in range(48))
print(new_secret)