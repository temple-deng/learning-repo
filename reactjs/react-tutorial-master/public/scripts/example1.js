
var Comment = React.createClass({
    rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

    render: function(){
     return (
        <div className="comment">
            <h2 className="commentAuthor">
                {this.props.author}
            </h2>
            <span dangerouslySetInnerHTML={this.rawMarkup()} />
        </div>    
        );
    }
});


var CommentList = React.createClass({
                      render: function(){ 
                        var commentItems = this.props.data.map(function(comment){
                            return <Comment author={comment.author}>
                                        {comment.text}
                                    </Comment>    
                        });
                        return (
                            <div className="commentList">
                                {commentItems}
                            </div>
                        );}
                  });

var CommentForm = React.createClass({
                      handleSubmit: function(event){
                        event.preventDefault();
                        var author = this.refs.author.value.trim();
                        var text= this.refs.text.value.trim();
                        if(!text || !author){
                            return;
                        }
                        this.props.onCommentSubmit({author: author, text: text});
                        this.refs.author.value = '';
                        this.refs.text.value = '';
                        return;
                      },
                      render: function(){ return (
                            <form className="commentForm" onSubmit={this.handleSubmit}>
                                <input type="text" ref="author" placeholder="Your name" />
                                <input type="text" ref="text" placeholder="Say something..." />
                                <input type="submit" value="Post"/>
                            </form>
                        );}
                  });


var CommentBox = React.createClass({
                      loadCommentsFromServer: function(){
                            $.ajax({
                                url: this.props.url,
                                dataType: 'json',
                                cache: false,
                                success: (data)=> {
                                    this.setState({data:data})
                                }.bind(this),
                                error: (xhr, status, err) =>{
                                    console.error(this.props.url, status, err.toString());
                                }.bind(this)
                            });
                      },
                      handleCommentSubmit: function(comment) {
                        // TODO: submit to the server and refresh the list
                        // this.state.data.push(comment);
                        // this.setState({data:this.state.data});
                        $.ajax({
                                url: this.props.url,
                                dataType: 'json',
                                data: comment,
                                type: 'POST',
                                success: (data)=> {
                                    this.setState({data:data})
                                }.bind(this),
                                error: (xhr, status, err) =>{
                                    console.error(this.props.url, status, err.toString());
                                }.bind(this)
                            });
                      },

                      getInitialState(){
                        return {data:[]}
                      },

                      componentDidMount: function() {
                        this.loadCommentsFromServer();
                        //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
                      },

                      render: function(){ 
                        return ( 
                          <div className="commentBox">
                           <h1> Comment </h1>
                           <CommentList data={this.state.data}/>
                           <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
                          </div>    
                              );
                            }
                });


ReactDOM.render(
            <CommentBox url="/api/comments"/>,
            //document.getElementById('content')
            $('#content')[0]
        );