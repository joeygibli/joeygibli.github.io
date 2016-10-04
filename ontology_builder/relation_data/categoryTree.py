import urllib2
from urllib import urlencode
import json
import time
import sys
import codecs
from bs4 import BeautifulSoup

#/w/api.php?action=categorytree&format=xml&category=Software
endpoint = "https://en.wikipedia.org/w/api.php?"
template = [('format','json'),('action','categorytree'),('options',"{'mode':'100'}")]#category=%s"

def titleFromLink(link):
    if link.find("<")==0: link = link[1:-1]
    return link.split("/")[-1].split("#")[0]
PREFIX="Category:"

def fetchCategoryData(query=None,title=None):
    query = endpoint + urlencode(query)
    response = urllib2.urlopen(urllib2.Request(query))#,headers={'User-Agent':'GNAT/0.3 (krivard@cs.cmu.edu)'}))
    sdata = response.read()
    data = json.loads(sdata)
    return data

if __name__=='__main__':
    skip = 0
    if len(sys.argv)<3:
        print "Usage:\n\t%s input.tsv output.tsv [skipN]\ninput fields:category, metadata(igored)\noutput fields: parent,child" % sys.argv[0]
        sys.exit(1)
    infile,outfile = sys.argv[1:3]
    print "Reading from %s, writing to %s" % (infile,outfile)
    if len(sys.argv)>3:
        skip = int(sys.argv[-1])
        print "Skipping %d queries..." % skip
    print "Query template:"
    print template
    with open(infile,"r") as f,open(outfile,"w" if skip==0 else "a") as o:
        last = time.time()-1
        lastMeta = ""
        tree = {}
        n=0
        m=0
        for line in f:
            (cat,meta) = line.strip().split("\t",1)
            if skip>0: 
                skip = skip-1
                continue
            if meta != lastMeta: 
                if m>0: print "%d in meta %s" % (m,lastMeta)
                print "meta: %s ... " % meta
                m = 0
                lastMeta = meta
            dt = time.time()-last
            if dt < 1: time.sleep(1-dt) # query at 1 Hz
            query = template + [('category', cat)]
            k=m
            print "%s ... " % cat,
            data = fetchCategoryData(query=query)
            last = time.time()
            if 'categorytree' not in data or '*' not in data['categorytree']:
                print "Trouble with query '%s':" % cat
                print data
                break
            soup = BeautifulSoup(data['categorytree']['*'],'html.parser')
            for a in soup.find_all("a"):
                m += 1
                n += 1
                p = a.text.encode("utf-8")
                if p not in tree: tree[p] = []
                else: print "ding! ",
                tree[p].append(cat.encode("utf-8"))
                # if 'pageid' not in page: 
                #     page['pageid'] = "N/A"
                #     page['title'] = "N/A"
                # info = "#\t%s\n" % "\t".join([tid,tname,str(page['pageid']),page['title']])
                # o.write( info.encode("utf-8") )
                # if 'categories' not in page: continue
                # for cat in page['categories']:
                #     foo = cat['title']
                #     if foo.startswith(PREFIX): foo = foo[len(PREFIX):]
                #     try:
                #         o.write(tid)
                #         o.write("\t")
                #         o.write(foo.encode("utf-8"))
                #         o.write("\n")
                #     except UnicodeEncodeError:
                #         print tid,type(tid)
                #         print foo,type(foo)
                #         raise
                #     n+=1
            print m-k
        print "%d parent-child relationships" % n
        for parent,children in tree.items():
            #print "%s %d" % (parent,len(children))
            try:
                o.write("\n".join(["%s\t%s" % (parent,child) for child in children]))
                o.write("\n")
            except UnicodeEncodeError:
                print parent
                print children
                raise
