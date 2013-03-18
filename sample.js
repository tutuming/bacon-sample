$(function(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // マウスでの描画座標ストリーム生成
  var mouseDrawStreamSource = function(element){
    return $(element).asEventStream('mousedown').doAction('.preventDefault').map(function(){
      return $(document).asEventStream('mousemove').doAction('.preventDefault').takeUntil(
        $(document).asEventStream('mouseup').doAction('.preventDefault')
      ).map(function(e){
        var offset = $(element).offset();
        return {
          x : e.pageX - offset.left,
          y : e.pageY - offset.top
        };
      });
    });
  };

  // タッチでの描画座標ストリーム生成
  var touchDrawStreamSource = function(element){
    return $(element).asEventStream('touchstart').doAction('.preventDefault').flatMap(function(e){
      return Bacon.fromArray(e.originalEvent.changedTouches);
    }).map(function(touch){
      var filterEventContainesTouch = function(stream){
        return stream.map(
          '.originalEvent.changedTouches'
        ).filter(function(touches){
          return _(touches).contains(touch)
        });
      };

      var endStream = filterEventContainesTouch(Bacon.mergeAll([
        $(document).asEventStream('touchend').doAction('.preventDefault'),
        $(document).asEventStream('touches').doAction('.preventDefault')
      ]));

      return filterEventContainesTouch(
        $(document).asEventStream('touchmove').doAction(
          '.preventDefault'
        ).takeUntil(
          endStream
        )
      ).map(function(e){
        var offset = $(element).offset();
        return {
          x : touch.pageX - offset.left,
          y : touch.pageY - offset.top
        };
      });
    });
  };

  var mouseStreamSource = mouseDrawStreamSource($('#canvas'));
  var touchStreamSource = touchDrawStreamSource($('#canvas'));
  var strokeStreamSource = mouseStreamSource.merge(touchStreamSource);

  // 太さ
  var sizeProperty = Bacon.UI.optionValue($('[name=size]'), '2').map(function(val){
    return parseInt(val, 10);
  });

  // 色
  var colorProperty = Bacon.UI.optionValue($('[name=color]'), 'red').decode({
    red : 'rgb(255, 0, 0)',
    green : 'rgb(0, 255, 0)',
    blue: 'rgb(0, 0, 255)'
  });

  var options = Bacon.combineTemplate({
    size : sizeProperty,
    color : colorProperty
  });

  // 描画
  options.sampledBy(strokeStreamSource, function(options, stream){
    return { options : options, stream : stream };
  }).onValue(function(args){
    var options = args.options;
    var stream = args.stream;

    // 2点の組みで返すストリーム
    var pointSetStream = stream.slidingWindow(2).filter(function(points){
      return points.length == 2;
    }).filter(function(points){
      var fromPoint = points[0], toPoint = points[1];
      return (fromPoint.x < canvas.width && fromPoint.y < canvas.height) ||
        (toPoint.x < canvas.width && toPoint.y < canvas.height)
    });

    pointSetStream.onValue(function(points){
      var fromPoint = points[0], toPoint = points[1];

      ctx.strokeStyle = options.color;
      ctx.lineWidth = options.size;

      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.lineTo(toPoint.x, toPoint.y);
      ctx.stroke();
    });
  });
});