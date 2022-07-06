import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function handlePagination(): void {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        setNextPage(data.next_page);

        const newPosts: Post[] = data.results.map((post): Post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...newPosts]);
      });
  }

  return (
    <>
      <main className={commonStyles.container}>
        <ul className={styles.posts}>
          {posts.map(post => {
            return (
              <li key={post.uid}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <h1>{post.data.title}</h1>
                    <p>{post.data.subtitle}</p>
                    <div className={styles.items}>
                      <FiCalendar />
                      <span>
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          {
                            locale: ptBR,
                          }
                        )}
                      </span>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </div>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      {nextPage && (
        <div className={styles.loadMore}>
          <button type="button" onClick={handlePagination}>
            Carregar mais posts
          </button>
        </div>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const results = postsResponse.results.map((post): Post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    results,
    next_page: postsResponse.next_page,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60 * 12, // 12 hours
  };
};
