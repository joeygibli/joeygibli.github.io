function [ namedE ] = num2name( E, N )
[l,~] = size(E);
namedE = num2cell(E);
for i=1:l
    namedE{i,1} = N{E(i,1)};
    namedE{i,2} = N{E(i,2)};
end
end

