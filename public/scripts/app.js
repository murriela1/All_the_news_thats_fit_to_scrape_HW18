$(document).on('click', "#mainButton", function(){
  console.log('Hello!');

  $.ajax({
    url: '/scrape'
  }).done(function(){
    $.getJSON('/article', function(data){
      var count = 1;
      for (var i =0; i <data.length; i++){
        $("#article").append(
          "<div class='individArticle' data-id=" + data[i]._id + "><h3>" + count + '. ' + data[i].title  +
          "</h3><p>" + data[i].author + "</p>" +
                "<p><a href='" + data[i].link + "' class='btn btn-primary' role='button'>Link</a> <a href='/article/" + data[i]._id +"' class='btn btn-default' role='button' id='noteButton'>Note</a></p>" +
                  "</div>")
        count++;
      }
    });
  });
});

$(document).on('click', "#noteButton", function(){
  console.log('Hello Notes!');

    var thisId = $(this).attr('data-id');

  $.ajax({
      method: "POST",
      url: "/article/" + thisId,
      data: {
        author: $('#author').val(), // value taken from title input
        content: $('#content').val() // value taken from note textarea
      }
  })

  .done(function( data ) {
      // log the response
      console.log(data);
    });

    $('#author').val("");
    $('#content').val("");
});