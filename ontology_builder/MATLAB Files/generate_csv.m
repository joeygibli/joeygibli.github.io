function [ ] = generate_csv( edges, filename )
%UNTITLED Summary of this function goes here
%   edge cells
fid = fopen(filename, 'w') ;
fprintf(fid, 'source,target,value\n');
[l,~] = size(edges);
for i = 1:l
    fprintf(fid, '%s,%s,%f\n%', edges{i,1}, edges{i,2}, edges{i,3});
end
fclose(fid);

end

