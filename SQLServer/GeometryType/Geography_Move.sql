declare @distancia_obj float = 10

declare @baseLat float = 20
declare @baseLng float = -60
declare @mov_lat float = - 1.0 / 60
DECLARE @source geography = geography::Point(@baseLat, @baseLng, 4326);
DECLARE @target geography = geography::Point(@baseLat + @mov_lat, @baseLng, 4326);
declare @distancia float = @source.STDistance(@target)

declare @distancia_corr float = @distancia
declare @mov_lat_corr float = @mov_lat
declare @i int = 1

print 'Origen   : ' + @source.ToString()
print 'Mov Lat  : ' + convert(varchar,@mov_lat)
print 'Destino  : ' + @target.ToString()
print 'Distancia: ' + convert(varchar,convert(decimal(20,10),@distancia))

declare @coef float, @coef_ant float = 1

while @i <= 100
begin
	set @coef = @distancia_obj / @distancia_corr
	set @mov_lat_corr = @mov_lat_corr * @coef
	declare @target_corr geography = geography::Point(@baseLat + @mov_lat_corr, @baseLng, 4326);
	set @distancia_corr = @source.STDistance(@target_corr)
	print '--- Iteracion: ' + convert(varchar,@i)
	print 'Coef     : ' + convert(varchar,convert(decimal(35,25),@coef))
	print 'Destino corr: ' + @target_corr.ToString()
	print 'Distancia corr: ' + convert(varchar,convert(decimal(20,10),@distancia_corr))

	set @i = @i + 1
	print '    Err      : ' + convert(varchar,abs(@coef - @coef_ant))
	if abs(@coef - @coef_ant)  < 1e-6
	begin
		break
	end

	set @coef_ant = @coef
end 

print '------------------------------------------------'
print '-- FINAL'
print '------------------------------------------------'
print 'Distancia: ' + convert(varchar,convert(decimal(20,6),@distancia_corr))
print 'Mov Lat  : ' + convert(varchar,@mov_lat_corr)

declare @gra float, @min float, @seg float, @sgn float

set @sgn = sign(@mov_lat_corr)
set @mov_lat_corr = abs(@mov_lat_corr)

set @gra = FLOOR(@mov_lat_corr)
set @min  = (@mov_lat_corr - FLOOR(@mov_lat_corr)) * 60
set @seg = @min - floor(@min)
set @min = floor(@min)

set @gra = @gra * @sgn

print '     Gra : ' + convert(varchar,@gra) + '° ' + convert(varchar,@min) + ''' ' + convert(varchar,@seg) + ''''''
;

go
-----------------------------------------------------------------
-- LONGITUD DEL MINUTO SEGUN LATITUD
-----------------------------------------------------------------
declare @baseLat float = 0
declare @baseLng float = -60
declare @mov_lat float = - 1.0 / 60

while @baseLat <= 90
begin 
	DECLARE @source geography = geography::Point(@baseLat, @baseLng, 4326);
	DECLARE @target geography = geography::Point(@baseLat + @mov_lat, @baseLng, 4326);
	declare @distancia float = @source.STDistance(@target)

	print  convert(varchar,@baseLat) + char(9) + convert(varchar,convert(decimal(20,10),@distancia))

	set @baseLat = @baseLat + 1
end