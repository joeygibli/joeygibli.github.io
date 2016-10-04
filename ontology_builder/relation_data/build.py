#!/usr/bin/python
from guineapig import *
import sys
from subprocessUtil import *
import os
logging.basicConfig(level=logging.DEBUG)

################################ GuineaPig helpers #######################################


DBP_PREFIX="<http://dbpedia.org/resource/"
DBP_PREFIX_N=len(DBP_PREFIX)

WP_INFIX="en.wikipedia.org/wiki/"
WP_INFIX_N=len(WP_INFIX)

def unwp(url):
    x = url.find(WP_INFIX)
    if x<0: return url
    ret = url[x+WP_INFIX_N:]
    x = ret.rfind("#")
    if x<0: return ret
    return ret[:x]

def undbp(dbp):
    x = dbp.find(DBP_PREFIX)
    if x<0: return dbp
    # also strip the final '>'
    return dbp[x+DBP_PREFIX_N:-1]

def endbp(ent):
    return "%s%s>" % (DBP_PREFIX,ent)


################################ Planner ##############################################

def sortPair( head, pair, tail=tuple()):
    if pair[0]<pair[1]:
        return head+pair+tail
    return head + (pair[1],pair[0]) + tail
"""
for each relation, get the category distribution over arg1 and arg2
"""
class Dbpedia(Planner):
    catData = ReadLines("filtered-joincats.tsv") | Filter(by=lambda x: not x.startswith("#")) | ReplaceEach(by=lambda x: tuple(x.strip().split("\t"))) # tagid,category
    so_so_infobox_data = ReadLines("so_so_infobox.gp") | ReplaceEach(by=lambda x: tuple(x.strip().split("\t"))) # tagid1,tagname1,eid1,score1,relation,tagid2,tagname2,eid2,score2
    hipmiData = ReadLines("high-pmi-pairs.txt") | ReplaceEach(by=lambda x: tuple(x.strip().split('\t'))) # pmi, tag1, tag2, count(tag1) count(tag2) count(tag1 & tag2)
    
    minfoboxData = ReplaceEach(so_so_infobox_data,by=lambda (tagid1,tagname1,eid1,score1,relation,tagid2,tagname2,eid2,score2): (tagid1,relation,tagid2))
    cat1rel_a = Join(Jin(minfoboxData,by=lambda (arg1,rel,arg2):arg1),Jin(catData,by=lambda (tagid,category):tagid)) | JoinTo(Jin(catData,by=lambda (tagid,category):tagid),by=lambda ((arg1,rel,arg2),(x,cat)):arg2)
    catrel = ReplaceEach(cat1rel_a,by=lambda (((arg1,rel,arg2),(x,cat1)),(y,cat2)): (arg1,cat1,rel,arg2,cat2))
    clusters_a = Group(catrel,by=lambda (arg1,cat1,rel,arg2,cat2):(cat1,rel,cat2),retaining=lambda(arg1,cat1,rel,arg2,cat2):(arg1,arg2))
    clusters_b = ReplaceEach(clusters_a, by=lambda ((cat1,rel,cat2),results):( (cat1,rel,cat2), len(results), results))
    clusters = Filter(clusters_b,by=lambda( (cat1,rel,cat2),size,instances ):size>10)
    catcdf = Group(catData,by=lambda (tagid,cat):cat,reducingTo=ReduceToCount()) | Format(by=lambda x:"\t".join([str(i) for i in x]))
    catrel_tsv = Format(catrel,by=lambda x:"\t".join(x))
    cats = ReplaceEach(catData,by=lambda (tagid,cat):cat) | Distinct() | Format(by=lambda x:x)
    catCdf = Group(catData, by=lambda(tagid,cat):cat, reducingTo=ReduceToCount()) | Format(by=lambda x: "\t".join([str(i) for i in x]))
    
    hipmiSort = ReplaceEach(hipmiData,by=lambda (pmi,tag1,tag2,c):sortPair(tuple([pmi]),(tag1,tag2)))
    hipmi_i_infobox_b = Join(Jin(so_so_infobox_data, by=lambda (tagid1,tag1,e1,s1,rel,tagid2,tag2,e2,s2):(tag1,tag2) if tag1<tag2 else (tag2,tag1)),Jin(hipmiSort,by=lambda (pmi,tag1,tag2):(tag1,tag2)))
    hipmi_i_infobox_d = ReplaceEach(hipmi_i_infobox_b,by=lambda ((tagid1,tag1,e1,s1,rel,tagid2,tag2,e2,s2),(pmi,t1,t2)):(pmi,tag1,rel,tag2))
    hipmi_i_infobox = Format(hipmi_i_infobox_d,by=lambda x: "\t".join(x))

if __name__=='__main__':
    Dbpedia().main(sys.argv)
