import nltk
english_vocab = set(w.lower() for w in nltk.corpus.words.words('en'))

substrings = ['th','ng','s','cr','st','pe','t','e','ge','ch','on','oo','nd','at','il','a']
strings = []

for a in range(0,len(substrings)):
	for b in range(0,len(substrings)):
		for c in range(0, len(substrings)):
			for d in range(0,len(substrings)):
				if (substrings[c] in ['ge','ch','on','oo'] or substrings[d] in ['ge','ch','on','oo']):
					strings.append((substrings[a] + substrings[b] + substrings[c] + substrings[d]))

words = [s for s in strings if s in english_vocab]
for s in words:
	print(s)



oldman = list('oldman')
bovine = list('bovine')
leaves = list('leaves')
clouds = list('clouds')
castle = list('castle')
golden = list('golden')
asleep = list('asleep')
riches = list('riches')

for a in oldman:
	for b in bovine:
		for c in leaves:
			for d in clouds:
				for e in castle:
					for f in golden:
						for g in asleep:
							for h in riches:
								string = ''.join([g,f,b,h,e,a,d,c])
								if string in english_vocab:
									print(string)
