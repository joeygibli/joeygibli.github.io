import math

def isPower251(num):
	h = 1
	Bmax = num
	while (Bmax != 0):
		h += 1
		Bmax = Bmax >> 1
	l = 0
	while (l <= h):
		x = int(math.floor((l+h)/2))
		power = 15251**x
		if (power == num):
			return True
		elif (power < num):
			l = x + 1
		else:
			h = x - 1
	return False