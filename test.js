$(function(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  ctx.lineWidth = 5;
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
          x : e.clientX - offset.left,
          y : e.clientY - offset.top
        };
      });
    });
  };

  // タッチでの描画座標ストリーム生成
  var touchDrawStreamSource = function(element){
    return $(this).asEventStream('touchstart').doAction('.preventDefault').flatMap(function(e){
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
          x : touch.clientX - offset.left,
          y : touch.clientY - offset.top
        };
      });
    });
  };

  var mouseStreamSource = mouseDrawStreamSource($('#canvas'));
  var touchStreamSource = touchDrawStreamSource($('#canvas'));

  var strokeStreamSource = mouseStreamSource.merge(touchStreamSource);

  // 座標のストリームを描画
  strokeStreamSource.onValue(function(stream){
    var rgb = _(_.range(3)).map(function(){ return Math.floor(Math.random() * 256); }).value().join(',')

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

      ctx.strokeStyle = "rgb(" + rgb + ")";
      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.lineTo(toPoint.x, toPoint.y);
      ctx.stroke();
    });

    pointSetStream.onEnd(function(){
    });
  });
});