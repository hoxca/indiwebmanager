// Startup function
  $(function()
  {
    loadCurrentProfileDrivers();            
    getStatus();
  }
  );
  
  function saveProfile()
  {
    var options = profiles.options;
    var name    = options[options.selectedIndex].value;
    var url     =  "/api/profiles/" + name
    
    //console.log(url)
        
    $.ajax(
    {
      type: 'POST',
      url : url,
      success: function()
      {     
        //console.log("add new a profile " + name);
        saveProfileDrivers(name); 
      },
      error: function()
      {
        alert('error add new  profile failed');
      }
    }    
    );
  }
  
  function saveProfileDrivers(profile)
  {

    var url     =  "/api/profiles/" + profile + "/";    
    var drivers = [];

   $("#drivers_list :selected").each(function (i,sel) 
   {
       drivers.push("{\"label\" : \"" + $(sel).text() + "\"}");    
   }
   );         
   
   drivers = JSON.stringify(drivers);
   
   //console.log("my json string is " + drivers);

    $.ajax(
    {
      type: 'POST',
      url : url,
      data: drivers,
      contentType: "application/json; charset=utf-8",
      success: function()
      {     
        //console.log("Drivers added successfully to profile");
        $("#notify_message").html('<br/><div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Profile ' + profile + ' saved.</div>');
      },
      error: function()
      {
        alert('error failed to add drivers to profile');
      }
    }    
    );       
  }
  
  function loadCurrentProfileDrivers()
  {
    clearDriverSelection();
        
    var name    = $("#profiles option:selected").text();
    var url     =  "/api/profiles/" + name
    
    $.ajax(
    {
      type: 'GET',
      url : url,
      dataType: "json",
      success: function(drivers)
      {     
        $.each(drivers, function(i, driver)
        { 
          var label    = driver.label;
          var selector = "#drivers_list [value='" + label + "']";
          $(selector).prop('selected', true);
        });
        
        $("#drivers_list").selectpicker('refresh');
      }
    },
    {
      error: function()
      {
        alert('error loading profile drivers');
      }
    }    
    );   
  }

    function clearDriverSelection()
  {
    $("#drivers_list option").prop('selected', false);
    $("#drivers_list").selectpicker('refresh');
    //console.log("done with clearDriverSelection");
    
  }
  
  function addNewProfile()
  {
      var profile_name = $("#new_profile_name").val();
      if (profile_name)
      {      
        //console.log("profile is " + profile_name);
        $("#profiles").append("<option id='" + profile_name + "' selected>" + profile_name + "</option>");
        clearDriverSelection();
        
        $("#notify_message").html('<br/><div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Profile ' + profile_name + ' created. Select the profile drivers and then save the profile.</div>');
      }
  }
  
  function removeProfile()
  {
    //console.log("in delete profile");
    var name    = $("#profiles option:selected").text();
    var url     =  "/api/profiles/" + name;
    
    console.log(url)
    
    if ($("#profiles option").size() == 1)
    {
        $("#notify_message").html('<br/><div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Cannot delete default profile.</div>');
        return;
    }
        
    $.ajax(
    {
      type: 'DELETE',
      url : url,
      success: function()
      {     
        //console.log("delete profile " + name);        
        $("#profiles option:selected").remove();  
        $("#profiles").selectpicker('refresh');
        loadCurrentProfileDrivers();
        
        $("#notify_message").html('<br/><div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Profile ' + name + ' deleted.</div>');
      },
      error: function()
      {
        alert('error delete profile failed');
      }
    }
    );
  }
  
  function toggleServer()
  {
      var status = $.trim($("#server_command").text());
      
      if (status == "Start")
      {
          
        if ($("#drivers_list :selected").size() == 0)
        {
            $("#notify_message").html('<br/><div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>No drivers selected!.</div>');
            return;
        }
    
        var drivers = [];
        var profile = $("#profiles option:selected").text()
        var port    = $("#server_port").val();        
        
        drivers.push({'profile' : profile});
        drivers.push({'port' : port});
        
        $("#drivers_list :selected").each(function (i,sel) 
        {
            drivers.push({'label' : $(sel).text()});    
        }
        );         
   
        drivers = JSON.stringify(drivers);
            
        $.ajax(
        {
        type: 'POST',
        url : '/api/server/start',
        data: drivers,
        contentType: "application/json; charset=utf-8",
        success: function()
        {                 
            //console.log("INDI Server started!");
            getStatus();
        },
        error: function()
        {
            alert('Failed to start INDI server.');
        }
        }    
        );                   
     }
     else
     {
         $.ajax(
        {
        type: 'POST',
        url : "/api/server/stop",
        success: function()
        {                 
            //console.log("INDI Server stopped!");
            getStatus();
        },
        error: function()
        {
            alert('Failed to stop INDI server.');
        }
        }    
        );            
     }     
  }
  
  function getStatus()
  {        
      $.getJSON("/api/server/status", function(data)
      {                        
          if (data[0].status == "True")
              getActiveDrivers();
          else
          {
              $("#server_command").html("<span class='glyphicon glyphicon-cog' aria-hidden='true'></span> Start");
              $("#server_notify").html("<p class='alert alert-success'>Server is offline.</p>");
          }
        
    });          
  }
  
  function getActiveDrivers()
  {        
      $.getJSON("/api/server/drivers", function(data)
      {
        $("#server_command").html("<span class='glyphicon glyphicon-cog' aria-hidden='true'></span> Stop");
        var msg = "<p class='alert alert-info'>Server is Online.<ul>";
        var counter=0;
        $.each(data, function(i, field)
        {
            msg += "<li>" + field.driver + "</li>";
            counter++;            
        });
        
        msg += "</ul></p>";
                
        $("#server_notify").html(msg);
        
        if (counter < $("#drivers_list :selected").size())
        {
            $("#notify_message").html('<br/><div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Not all requested drivers are running. Make sure all devices are powered and connected.</div>');
            return;            
        }
      });
            
  }

      
